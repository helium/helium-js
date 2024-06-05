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
  ProgressKeys,
  ProgressStep,
} from './types'
import ConfigurationClient from './ConfigurationClient'

type AddToOnboardingServerOpts = {
  authToken?: string
  batch?: string
  deviceType?: DeviceType
  heliumSerial?: string
  macEth0?: string
  macWlan0?: string
  rpiSerial?: string
}

export default class MobileHotspotOnboarding {
  private _configurationClient!: ConfigurationClient
  private _wifiClient?: WifiHttpClient
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

  private _wifiBaseUrl?: string
  public get wifiBaseUrl(): string | undefined {
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
    wifiBaseUrl?: string
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

    if (opts.wifiBaseUrl) {
      this._wifiClient = new WifiHttpClient({
        owner: opts.wallet,
        baseURL: opts.wifiBaseUrl,
        apiVersion: opts.wifiApiVersion,
        mockRequests: opts.shouldMock,
        errorCallback: opts.errorCallback,
        logCallback: opts.logCallback,
      })
    }

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

    this._logCallback?.('Initialized MobileHotspotOnboarding', opts)
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

  private getWifiClient = () => {
    if (!this._wifiClient) {
      throw new Error('Wifi base url not set')
    }

    return this._wifiClient
  }

  signGatewayAddTransaction = async (
    deviceType: ManufacturedDeviceType,
    opts?: AddToOnboardingServerOpts,
  ) => {
    this.setProgressToStep('get_add_gateway')
    this.writeLog('Getting add gateway txn', { deviceType, cluster: this._cluster })
    const { txn: txnStr, apiVersion } = await this.getWifiClient().signGatewayAddTransaction(
      this._cluster,
      deviceType,
    )
    this.writeLog('Got add gateway str', { txnStr })
    const txn = AddGatewayV1.fromString(txnStr)
    this.setProgressToStep('got_add_gateway')

    await this.addToOnboardingServer({
      ...opts,
      hotspotAddress: txn.gateway?.b58 || '',
    })

    return { txn, apiVersion }
  }

  checkFwValid = async (minVersion?: string) => {
    this.writeLog('Checking firmware version')
    const fwInfo = await this.getWifiClient().getVersionDetails()

    const minFirmwareVersion = minVersion || 'v0.10.0'

    this.writeLog('Firmware version is', {
      data: { ...fwInfo, minFirmwareVersion },
    })

    const { status, firmwareVersion } = fwInfo

    const isSuccessful = status >= 200 && status < 300

    if (!isSuccessful || !firmwareVersion) {
      throw new Error('Could not determine firmware version.')
    }

    if (firmwareVersion.startsWith('dev')) return true

    const gatewayFW = firmwareVersion.replace(/[^0-9.]/g, '')
    const minFW = minFirmwareVersion.replace(/[^0-9.]/g, '')

    return compareVersions(gatewayFW, minFW) >= 0
  }

  getGpsLocation = async (deviceType: OutdoorManufacturedDeviceType) => {
    return this.getWifiClient().getGpsLocation(deviceType)
  }

  getApiVersion = () => {
    return this.getWifiClient().getApiVersion()
  }

  getWifiAssertData = async ({
    gateway,
    elevation,
    location,
    deviceType,
    azimuth,
  }: {
    azimuth?: number
    gateway: string
    elevation?: number
    location: string
    deviceType: 'WifiIndoor' | 'WifiOutdoor'
  }) => {
    return this._solanaOnboarding.getAssertData({
      azimuth,
      gateway,
      elevation,
      location,
      deviceType,
    })
  }

  getCbrsAssertData = async ({
    gateway,
    decimalGain,
    elevation,
    location,
  }: {
    gateway: string
    decimalGain?: number
    elevation?: number
    location: string
  }) => {
    // We update assert data for the IOT network only
    // For the MOBILE network we don't set location. They must update their radio location at https://hotspots.hellohelium.com
    return this._solanaOnboarding.getAssertData({
      gateway,
      decimalGain,
      elevation,
      location,
      deviceType: 'Cbrs',
    })
  }

  getMobileOnboardTxns = async ({
    hotspotAddress,
    azimuth,
    location,
    elevation,
  }: {
    hotspotAddress: string
    location?: string
    elevation?: number
    azimuth?: number
  }) => {
    this.writeLog('Getting MOBILE onboard txns')
    this.setProgressToStep('fetch_mobile')

    const onboardTxns = await this._onboardingClient.onboard({
      hotspotAddress,
      location,
      type: 'MOBILE',
      elevation,
      azimuth,
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

    let txIds: string[] = []
    let tries = 0

    while (!txIds.length && tries < 12) {
      tries++
      try {
        const createTxns = await this._onboardingClient.createHotspot({
          transaction,
        })
        const solanaTransactions = createTxns?.data?.solanaTransactions

        if (solanaTransactions?.length) {
          this.writeLog('Created hotspot onboard txns')
        } else {
          this.writeLog('Could not create hotspot onboard txns', createTxns)
          throw new Error(
            `No solana transactions returned from create hotspot\n\n${JSON.stringify(createTxns)}`,
          )
        }

        this.writeLog('Submitting hotspot to solana')
        this.setProgressToStep('submit_create')
        txIds = await this._solanaOnboarding.submitAll({
          txns: solanaTransactions.map((t) => Buffer.from(t)),
        })
        this.writeLog('Hotspot has successfully been submitted to solana', { data: txIds })
      } catch (e) {
        this.writeError(e)
      }

      if (!txIds.length) {
        await sleep(5000) // wait 5 seconds before trying again
      }
    }

    if (!txIds.length) {
      throw new Error('Failed to create hotspot')
    }

    return txIds
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
    // We check if the asset exists up to 60 times
    // This equates to 180 seconds or 3 minutes
    for (let i = 0; i < 60; i++) {
      // waiting for the asset to be created on solana
      await sleep(3000)

      try {
        const hotspotPubKey = await this._solanaOnboarding.hotspotToAssetKey(hotspotAddress)
        if (hotspotPubKey) {
          this.writeLog(`Hotspot has been found: ${hotspotPubKey?.toBase58()} ${hotspotAddress}`)
          return hotspotPubKey
        } else {
          this.writeLog(`Hotspot not yet found ${hotspotAddress}`)
        }
      } catch (e) {
        if (i === 59) {
          // if we've reached the end of the loop, write the error
          this.writeError(e)
        }
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

    // We check if the mobile info exists up to 60 times
    // This equates to 180 seconds or 3 minutes
    for (let i = 0; i < 60; i++) {
      // waiting for the asset to be created on solana
      await sleep(3000)

      try {
        const hotspotInfo = await this._solanaOnboarding.getHotspotDetails({
          networkType: 'MOBILE',
          address: hotspotAddress,
        })

        if (hotspotInfo) {
          this.writeLog('Hotspot has been onboarded to MOBILE')
        } else {
          this.writeLog('Hotspot MOBILE details not yet found.')
        }

        if (hotspotInfo) return hotspotInfo
      } catch (e) {
        this.writeLog('Hotspot MOBILE details not yet found.')
        if (i === 59) {
          // if we've reached the end of the loop, write the error
          this.writeError(e)
        }
      }
    }

    return undefined
  }

  addToOnboardingServer = async ({
    authToken,
    hotspotAddress,
    batch,
    deviceType,
    heliumSerial,
    macEth0,
    macWlan0,
    rpiSerial,
  }: AddToOnboardingServerOpts & { hotspotAddress: string }) => {
    if (
      this._shouldMock ||
      this._cluster !== 'devnet' ||
      !authToken ||
      !batch ||
      !deviceType ||
      !heliumSerial ||
      !macEth0 ||
      !macWlan0 ||
      !rpiSerial
    ) {
      return
    }

    // If onboarding to devnet, we create the hotspot on the onboarding server
    try {
      await this._onboardingClient.addToOnboardingServer({
        authToken,
        onboardingKey: hotspotAddress,
        batch,
        deviceType,
        heliumSerial,
        macEth0,
        macWlan0,
        rpiSerial,
      })
      await sleep(1000)
    } catch (e) {
      // if it's already been added, we don't need to do anything
      this.writeError(e)
    }
  }

  createHotspotGetOnboardTxns = async ({
    addGatewayTxn,
    authToken,
    azimuth,
    location,
    elevation,
    ...opts
  }: AddToOnboardingServerOpts & {
    addGatewayTxn: string
    location?: string
    azimuth?: number | undefined
    elevation?: number | undefined
  }) => {
    const addGatewayV1 = AddGatewayV1.fromString(addGatewayTxn)
    if (!addGatewayV1.gateway) {
      throw new Error('invalid add_gateway_v1 txn string')
    }
    const hotspotAddress = addGatewayV1.gateway.b58

    await this.addToOnboardingServer({
      ...opts,
      authToken,
      hotspotAddress,
    })

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
    try {
      const hotspotInfo = await this._solanaOnboarding.getHotspotDetails({
        networkType: 'MOBILE',
        address: hotspotAddress,
      })
      if (hotspotInfo) {
        this.writeLog('Hotspot has already been onboarded')
        if (!this._shouldMock) {
          throw new Error('Hotspot has already been onboarded')
        }
      } else {
        this.writeLog('Hotspot MOBILE details not found.')
      }
    } catch {
      this.writeLog('Hotspot MOBILE details not found.')
    }

    const txns = await this.getMobileOnboardTxns({
      location,
      hotspotAddress,
      azimuth,
      elevation,
    })

    return txns
  }

  getHotspotAssetKey = async (hotspotAddress: string) => {
    return this._solanaOnboarding.hotspotToAssetKey(hotspotAddress)
  }

  onWifiHotspotCreated = async (hotspotAddress: string) => {
    const asset = await this._solanaOnboarding.hotspotToAssetKey(hotspotAddress)
    if (!asset) {
      this.writeLog('Hotspot asset not found')
      throw new Error('Hotspot Asset not found')
    }

    this.writeLog('Calling onHotspotCreated', { data: { asset: asset.toBase58() } })

    try {
      await this.getWifiClient().onHotspotCreated({
        assetId: asset.toBase58(),
        cluster: this._cluster,
      })
    } catch (e) {
      this.writeError(e)
      throw e
    }

    this.setProgressToStep('complete')
  }

  submitAndCompleteOnboarding = async ({
    hotspotAddress,
    signedTxns,
    deviceType,
  }: {
    hotspotAddress: string
    signedTxns: Buffer[]
    deviceType: DeviceType
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

    if (deviceType === 'WifiIndoor' || deviceType === 'WifiOutdoor') {
      this.writeLog('Calling onHotspotCreated', { data: { asset: asset.toBase58() } })

      try {
        await this.getWifiClient().onHotspotCreated({
          assetId: asset.toBase58(),
          cluster: this._cluster,
        })
      } catch (e) {
        this.writeError(e)
        throw e
      }
    }

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
    antenna?: number
  }) {
    return this._configurationClient.createConfigurationMessage(opts)
  }

  async sendConfigurationMessage(opts: {
    hotspotAddress: string
    originalMessage: Uint8Array
    signedMessage: Uint8Array
    token: string
    vendorSlug?: string
  }) {
    this._logCallback?.('Sending configuration message')
    const response = await this._configurationClient.sendConfigurationMessage(opts)
    this._logCallback?.('Configuration message sent')
    return response
  }
}
