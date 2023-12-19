import { AddGatewayV1 } from '@helium/transactions'
import WifiHttpClient from './WifiHttpClient'
import OnboardingClient from './OnboardingClient'
import SolanaOnboarding from './SolanaOnboarding'
import { Cluster, Connection, PublicKey } from '@solana/web3.js'
import sleep from './sleep'
import { compareVersions } from 'compare-versions'
import {
  DeviceType,
  HeightType,
  ManufacturedDeviceType,
  OutdoorManufacturedDeviceType,
} from './types'
import ConfigurationClient from './ConfigurationClient'

const ProgressKeys = [
  'get_add_gateway',
  'got_add_gateway',
  'fetch_create',
  'submit_create',
  'verify_create',
  'fetch_mobile',
  'got_mobile',
  'submit_signed_messages',
  'verify_mobile',
  'shutdown_wifi',
  'complete',
] as const
type ProgressStep = (typeof ProgressKeys)[number]

export default class MobileWifiOnboarding {
  private _configurationClient!: ConfigurationClient
  private _wifiClient!: WifiHttpClient
  private _onboardingClient!: OnboardingClient
  private _solanaOnboarding!: SolanaOnboarding
  private _progressCallback?: (progress: number, step?: ProgressStep) => void
  private _progressStep?: ProgressStep
  private _progress = 0
  private _errorCallback?: (e: unknown) => void
  private _logCallback?: (message: string, data?: { [key: string]: any }) => void
  private _shouldMock: boolean

  private _cluster: Cluster
  public get cluster(): Cluster {
    return this._cluster
  }

  private _wifiBaseUrl!: string
  public get wifiBaseUrl(): string {
    return this._wifiBaseUrl
  }

  private _onboardingClientUrl!: string
  public get onboardingClientUrl(): string {
    return this._onboardingClientUrl
  }

  private _wallet!: PublicKey
  public get wallet(): PublicKey {
    return this._wallet
  }

  private _rpcEndpoint!: string
  public get rpcEndpoint(): string {
    return this._rpcEndpoint
  }

  constructor(opts: {
    wifiBaseUrl: string
    wifiApiVersion?: 'v2' | 'v1'
    onboardingClientUrl: string
    shouldMock?: boolean
    wallet: PublicKey
    rpcEndpoint: string
    cluster: Cluster
    errorCallback?: (e: unknown) => void
    logCallback?: (message: string, data?: { [key: string]: any }) => void
    progressCallback?: (progress: number, step?: ProgressStep) => void
  }) {
    this._wifiBaseUrl = opts.wifiBaseUrl
    this._onboardingClientUrl = opts.onboardingClientUrl
    this._shouldMock = opts.shouldMock || false
    this._wallet = opts.wallet
    this._rpcEndpoint = opts.rpcEndpoint
    this._cluster = opts.cluster
    this._progressCallback = opts.progressCallback

    this._configurationClient = new ConfigurationClient({
      cluster: opts.cluster,
      mockRequests: opts.shouldMock,
      wallet: opts.wallet,
    })

    this._wifiClient = new WifiHttpClient({
      owner: opts.wallet,
      baseURL: opts.wifiBaseUrl,
      apiVersion: opts.wifiApiVersion,
      mockRequests: opts.shouldMock,
      errorCallback: opts.errorCallback,
      logCallback: opts.logCallback,
    })
    this._onboardingClient = new OnboardingClient(opts.onboardingClientUrl, {
      mockRequests: opts.shouldMock,
    })

    this._solanaOnboarding = new SolanaOnboarding({
      onboardingClient: this._onboardingClient,
      shouldMock: opts.shouldMock,
      wallet: opts.wallet,
      connection: new Connection(opts.rpcEndpoint),
      cluster: opts.cluster,
    })

    this._logCallback = opts.logCallback
    this._errorCallback = opts.errorCallback

    this._logCallback?.('Initialized MobileWifiOnboarding', opts)
  }

  writeError = (error: unknown) => {
    this._errorCallback?.(error)
  }

  writeLog = (message: string, data?: { [key: string]: any }) => {
    this._logCallback?.(message, data)
  }

  private setProgressToStep = (step: ProgressStep) => {
    this._progressStep = step
    this._progress = (ProgressKeys.indexOf(step) + 1) / ProgressKeys.length

    if (this._progressCallback) {
      this._progressCallback(this._progress, this._progressStep)
    }
  }

  signGatewayAddTransaction = async (deviceType: ManufacturedDeviceType) => {
    this.setProgressToStep('get_add_gateway')
    const { txn: txnStr, apiVersion } = await this._wifiClient.signGatewayAddTransaction(
      this._cluster,
      deviceType,
    )
    const txn = AddGatewayV1.fromString(txnStr)
    this.setProgressToStep('got_add_gateway')
    return { txn, apiVersion }
  }

  checkFwValid = async (minVersion?: string) => {
    this.writeLog('Checking firmware version')
    const fwInfo = await this._wifiClient.getVersionDetails()

    const minFirmwareVersion = minVersion || 'v0.10.0'

    this.writeLog('Firmware version is', {
      data: { ...fwInfo, minFirmwareVersion },
    })

    const { status, firmwareVersion } = fwInfo

    const isSuccessful = status >= 200 && status < 300

    if (!isSuccessful || !firmwareVersion) return false

    if (firmwareVersion.startsWith('dev')) return true

    const gatewayFW = firmwareVersion.replace(/[^0-9.]/g, '')
    const minFW = minFirmwareVersion.replace(/[^0-9.]/g, '')

    return compareVersions(gatewayFW, minFW) >= 0
  }

  getGpsLocation = async (deviceType: OutdoorManufacturedDeviceType) => {
    return this._wifiClient.getGpsLocation(deviceType)
  }

  getApiVersion = () => {
    return this._wifiClient.getApiVersion()
  }

  getMobileAssertData = async ({
    gateway,
    decimalGain,
    elevation,
    location,
    deviceType,
  }: {
    gateway: string
    decimalGain?: number
    elevation?: number
    location: string
    deviceType: DeviceType
  }) => {
    return this._solanaOnboarding.getAssertData({
      gateway,
      decimalGain,
      elevation,
      location,
      deviceType,
    })
  }

  getMobileOnboardTxns = async ({
    hotspotAddress,
    location,
    elevation,
    gain,
  }: {
    hotspotAddress: string
    location?: string
    elevation?: number
    gain?: number
  }) => {
    this.writeLog('Getting MOBILE onboard txns')
    this.setProgressToStep('fetch_mobile')

    const onboardTxns = await this._onboardingClient.onboard({
      hotspotAddress,
      location,
      type: 'MOBILE',
      elevation,
      gain,
    })

    if (!onboardTxns.data?.solanaTransactions?.length) {
      const err = new Error(
        `Failed to get onboard txn(s) for MOBILE network. Code: ${onboardTxns.code} - ${onboardTxns.errorMessage}`,
      )
      this.writeError(err)
      throw err
    }

    try {
      this.writeLog('Return solana transactions for onboarding')
      this.setProgressToStep('got_mobile')
      const txns = onboardTxns.data.solanaTransactions
      return txns.map((tx) => Buffer.from(tx).toString('base64'))
    } catch (e) {
      this.writeLog('Something went wrong with onboarding')
      this.writeError(e)
      return []
    }
  }

  createHotspot = async ({ transaction }: { transaction: string }) => {
    this._logCallback?.('Creating hotspot on Solana', { transaction })
    this.setProgressToStep('fetch_create')

    let solanaTransactions: number[][] | undefined = undefined

    try {
      const createTxns = await this._onboardingClient.createHotspot({
        transaction,
      })
      solanaTransactions = createTxns.data?.solanaTransactions
      if (solanaTransactions?.length) {
        this.writeLog('Created hotspot onboard txns')
      } else {
        this.writeLog('Could not create hotspot onboard txns', createTxns)
      }
    } catch (e) {
      this.writeError(e)
    }

    try {
      if (!solanaTransactions?.length) {
        throw new Error('No solana transactions returned from create hotspot')
      }

      this.writeLog('Submitting hotspot to solana')
      this.setProgressToStep('submit_create')
      const txnids = await this._solanaOnboarding.submitAll({
        txns: solanaTransactions.map((t) => Buffer.from(t)),
      })
      this.writeLog('Hotspot has successfully been submitted to solana', { data: txnids })
      return txnids
    } catch (e) {
      this.writeError(e)
      throw e
    }
  }

  verifyHotspotCreated = async (hotspotAddress: string) => {
    this.setProgressToStep('verify_create')

    if (this._shouldMock) {
      return this._solanaOnboarding.hotspotToAssetKey(hotspotAddress)
    }

    // sometimes create hotspot takes a really long time and solana can't
    // confirm that it was successfully created. This is a hacky way
    // to verify the asset was created. Every 3 seconds, we check to see
    // if the asset exists. If it does, we stop checking.
    // We check if the asset exists up to 200 times
    // This equates to 600 seconds or 10 minutes
    for (let i = 0; i < 200; i++) {
      // waiting for the asset to be created on solana
      await sleep(3000)

      try {
        const hotspotPubKey = await this._solanaOnboarding.hotspotToAssetKey(hotspotAddress)
        this.writeLog(`Hotspot asset found?: ${hotspotPubKey?.toBase58()} ${hotspotAddress}`)
        if (hotspotPubKey) return hotspotPubKey
      } catch (e) {
        this.writeError(e)
      }
    }
    return undefined
  }

  verifyMobileInfo = async (hotspotAddress: string) => {
    this.setProgressToStep('verify_mobile')

    if (this._shouldMock) {
      return this._solanaOnboarding.getHotspotDetails({
        networkType: 'MOBILE',
        address: hotspotAddress,
      })
    }

    // We check if the mobile info exists up to 200 times
    // This equates to 600 seconds or 10 minutes
    for (let i = 0; i < 200; i++) {
      // waiting for the asset to be created on solana
      await sleep(3000)

      try {
        const hotspotInfo = await this._solanaOnboarding.getHotspotDetails({
          networkType: 'MOBILE',
          address: hotspotAddress,
        })

        this.writeLog(`Hotspot ${!!hotspotInfo ? 'has' : 'has not'} been onboarded to MOBILE`)
        if (hotspotInfo) return hotspotInfo
      } catch (e) {
        this.writeError(e)
      }
    }
    return undefined
  }

  createHotspotGetOnboardTxns = async ({
    addGatewayTxn,
    authToken,
    location,
    elevation,
    gain,
    ...opts
  }: {
    addGatewayTxn: string
    authToken?: string
    location?: string
    deviceType: DeviceType
    batch: string
    heliumSerial: string
    macEth0: string
    macWlan0: string
    rpiSerial: string
    elevation?: number | undefined
    gain?: number | undefined
  }) => {
    const addGatewayV1 = AddGatewayV1.fromString(addGatewayTxn)
    if (!addGatewayV1.gateway) {
      throw new Error('invalid add_gateway_v1 txn string')
    }
    const hotspotAddress = addGatewayV1.gateway.b58

    if (!this._shouldMock && authToken && this._cluster === 'devnet') {
      // If onboarding to devnet, we create the hotspot on the onboarding server
      try {
        await this._onboardingClient.addToOnboardingServer({
          ...opts,
          authToken,
          onboardingKey: hotspotAddress,
        })
        await sleep(1000)
      } catch (e) {
        this.writeError(e)
      }
    }

    let hotspotPubKey: PublicKey | undefined
    try {
      hotspotPubKey = await this._solanaOnboarding.hotspotToAssetKey(hotspotAddress)
    } catch (e) {
      this.writeError(e)
    }

    if (hotspotPubKey) {
      this.writeLog('Hotspot already exists, no need to create')
    } else {
      await this.createHotspot({
        transaction: addGatewayTxn,
      })
    }

    hotspotPubKey = await this.verifyHotspotCreated(hotspotAddress)

    if (!hotspotPubKey) {
      const err = new Error('Failed to verify hotspot created')
      this.writeError(err)
      throw err
    }

    // Check if this hotspot has already been onboarded to MOBILE
    let needsOnboarding = true
    try {
      const hotspotInfo = await this._solanaOnboarding.getHotspotDetails({
        networkType: 'MOBILE',
        address: hotspotAddress,
      })
      if (hotspotInfo) {
        needsOnboarding = false
      }
      this.writeLog(`Hotspot ${!!hotspotInfo ? 'has' : 'has not'} been onboarded to MOBILE`)
    } catch (e) {
      this.writeError(e)
    }

    if (!this._shouldMock && !needsOnboarding) {
      return []
    }

    const txns = await this.getMobileOnboardTxns({
      location,
      hotspotAddress,
      elevation,
      gain,
    })

    return txns
  }

  getHotspotAssetKey = async (hotspotAddress: string) => {
    return this._solanaOnboarding.hotspotToAssetKey(hotspotAddress)
  }

  onHotspotCreated = async (hotspotAddress: string) => {
    this.setProgressToStep('shutdown_wifi')
    const asset = await this._solanaOnboarding.hotspotToAssetKey(hotspotAddress)
    if (!asset) {
      this.writeLog('Hotspot asset not found')
      throw new Error('Hotspot Asset not found')
    }

    this.writeLog('Calling onHotspotCreated', { data: { asset: asset.toBase58() } })

    let shutdownSuccess = false
    try {
      shutdownSuccess = await this._wifiClient.onHotspotCreated({
        assetId: asset.toBase58(),
        cluster: this._cluster,
      })
    } catch (e) {
      this.writeError(e)
      throw e
    }

    if (!shutdownSuccess) {
      throw new Error('Failed to shutdown wifi')
    }

    this.writeLog(`Shutdown wifi success: ${shutdownSuccess}`)

    this.setProgressToStep('complete')

    return shutdownSuccess
  }

  submitAndCompleteOnboarding = async ({
    hotspotAddress,
    signedTxns,
  }: {
    hotspotAddress: string
    signedTxns: Buffer[]
  }) => {
    this.writeLog('Submitting MOBILE onboard txns to solana')
    this.setProgressToStep('submit_signed_messages')

    const asset = await this._solanaOnboarding.hotspotToAssetKey(hotspotAddress)
    if (!asset) {
      const err = new Error('Hotspot Asset not found')
      this.writeError(err)
      throw err
    }

    let txnIds: string[] = []
    if (signedTxns.length) {
      try {
        txnIds = await this._solanaOnboarding.submitAll({ txns: signedTxns })
      } catch (e) {
        this.writeError(e)
        throw e
      }
    }

    this.writeLog('Finished submitting onboarding txns to solana', {
      txnIds,
    })

    if (!txnIds.length) {
      this.writeError('No txnIds returned from solana submission')
    }

    const mobileInfo = await this.verifyMobileInfo(hotspotAddress)
    if (!mobileInfo) {
      const err = new Error('Failed to verify mobile info')
      this.writeError(err)
      throw err
    }
    this.setProgressToStep('shutdown_wifi')

    this.writeLog('Calling onHotspotCreated', { data: { asset: asset.toBase58() } })

    let shutdownSuccess = false
    try {
      shutdownSuccess = await this._wifiClient.onHotspotCreated({
        assetId: asset.toBase58(),
        cluster: this._cluster,
      })
    } catch (e) {
      this.writeError(e)
      throw e
    }
    this.writeLog(`Shutdown wifi success: ${shutdownSuccess}`)

    this.setProgressToStep('complete')
    return { txnIds }
  }

  createTransferCompressedCollectableTxn = async ({
    newOwner,
    hotspotAddress,
  }: {
    newOwner: string
    hotspotAddress: string
  }) => {
    return this._solanaOnboarding.createTransferCompressedCollectableTxn({
      newOwner,
      hotspotAddress,
    })
  }

  createTransferInstructions = async ({
    newOwner,
    hotspotAddress,
  }: {
    newOwner: string
    hotspotAddress: string
  }) => {
    return this._solanaOnboarding.createTransferInstructions({
      newOwner,
      hotspotAddress,
    })
  }

  async createConfigurationMessage(opts: {
    lat: number
    lng: number
    heightInMeters: number
    azimuth: number
    heightType: HeightType
    hotspotAddress: string
  }) {
    return this._configurationClient.createConfigurationMessage(opts)
  }

  async sendConfigurationMessage(opts: {
    hotspotAddress: string
    originalMessage: Uint8Array
    signedMessage: Uint8Array
    token: string
  }) {
    this._logCallback?.('Sending configuration message')
    const response = await this._configurationClient.sendConfigurationMessage(opts)
    this._logCallback?.('Configuration message sent')
    return response
  }
}
