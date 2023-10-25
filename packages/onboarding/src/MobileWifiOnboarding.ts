import { AddGatewayV1 } from '@helium/transactions'
import WifiHttpClient from './WifiHttpClient'
import OnboardingClient from './OnboardingClient'
import SolanaOnboarding from './SolanaOnboarding'
import { Cluster, Connection, PublicKey } from '@solana/web3.js'
import sleep from './sleep'
import { compareVersions } from 'compare-versions'

const ProgressKeys = [
  'get_add_gateway',
  'got_add_gateway',
  'fetch_create',
  'submit_create',
  'verify_create',
  'fetch_mobile',
  'got_mobile',
  'submit_mobile',
  'verify_mobile',
  'shutdown_wifi',
  'complete',
] as const
type ProgressStep = (typeof ProgressKeys)[number]

export default class MobileWifiOnboarding {
  private wifiClient!: WifiHttpClient
  private onboardingClient!: OnboardingClient
  private solanaOnboarding!: SolanaOnboarding
  private progressCallback?: (progress: number, step?: ProgressStep) => void
  private progressStep?: ProgressStep
  private progress = 0
  private errorCallback?: (e: unknown) => void
  private logCallback?: (message: string, data?: { [key: string]: any }) => void
  public wifiBaseUrl: string
  public onboardingClientUrl: string
  public shouldMock: boolean
  public wallet: PublicKey
  public rpcEndpoint: string
  public cluster: Cluster

  constructor(opts: {
    wifiBaseUrl: string
    onboardingClientUrl: string
    shouldMock?: boolean
    wallet: PublicKey
    rpcEndpoint: string
    cluster: Cluster
    errorCallback?: (e: unknown) => void
    logCallback?: (message: string, data?: { [key: string]: any }) => void
    progressCallback?: (progress: number, step?: ProgressStep) => void
  }) {
    this.wallet = opts.wallet
    this.cluster = opts.cluster
    this.rpcEndpoint = opts.rpcEndpoint
    this.wifiBaseUrl = opts.wifiBaseUrl
    this.onboardingClientUrl = opts.onboardingClientUrl
    this.shouldMock = opts.shouldMock || false
    this.progressCallback = opts.progressCallback

    this.wifiClient = new WifiHttpClient({
      owner: opts.wallet,
      baseURL: opts.wifiBaseUrl,
      mockRequests: opts.shouldMock,
    })
    this.onboardingClient = new OnboardingClient(opts.onboardingClientUrl, {
      mockRequests: opts.shouldMock,
    })

    this.solanaOnboarding = new SolanaOnboarding({
      onboardingClient: this.onboardingClient,
      shouldMock: opts.shouldMock,
      wallet: opts.wallet,
      connection: new Connection(opts.rpcEndpoint),
      cluster: opts.cluster,
    })

    this.logCallback = opts.logCallback
    this.errorCallback = opts.errorCallback

    this.logCallback?.('Initialized MobileWifiOnboarding', opts)
  }

  writeError = (error: unknown) => {
    this.errorCallback?.(error)
  }

  writeLog = (message: string, data?: { [key: string]: any }) => {
    this.logCallback?.(message, data)
  }

  private setProgressToStep = (step: ProgressStep) => {
    this.progressStep = step
    this.progress = (ProgressKeys.indexOf(step) + 1) / ProgressKeys.length

    if (this.progressCallback) {
      this.progressCallback(this.progress, this.progressStep)
    }
  }

  getAddGatewayTxn = async () => {
    this.setProgressToStep('get_add_gateway')
    const txnStr = await this.wifiClient.getTxnFromGateway()
    const txn = AddGatewayV1.fromString(txnStr)
    this.setProgressToStep('got_add_gateway')
    return txn
  }

  checkFwValid = async () => {
    this.writeLog('Checking firmware version')
    const fwInfo = await this.wifiClient.checkFwValid()
    const minFirmwareVersion = '0.10.0'

    this.writeLog('Firmware version is', {
      data: { ...fwInfo, minFirmwareVersion },
    })

    const { status, firmwareVersion } = fwInfo

    const isSuccessful = status >= 200 && status < 300

    if (!isSuccessful || !firmwareVersion) return false

    return compareVersions(firmwareVersion, minFirmwareVersion) >= 0
  }

  getMobileAssertData = async ({
    gateway,
    decimalGain,
    elevation,
    location,
    maker,
  }: {
    gateway: string
    decimalGain?: number
    elevation?: number
    location: string
    maker: PublicKey
  }) => {
    return this.solanaOnboarding.getAssertData({
      gateway,
      decimalGain,
      elevation,
      location,
      hotspotTypes: ['MOBILE'],
      maker,
    })
  }

  getMobileOnboardTxns = async ({
    hotspotAddress,
    location,
  }: {
    hotspotAddress: string
    location?: string
  }) => {
    this.writeLog('Getting MOBILE onboard txns')
    this.setProgressToStep('fetch_mobile')

    const onboardTxns = await this.onboardingClient.onboard({
      hotspotAddress,
      location,
      type: 'MOBILE',
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
    this.logCallback?.('Creating hotspot on Solana', { transaction })
    this.setProgressToStep('fetch_create')

    let solanaTransactions: number[][] | undefined = undefined
    try {
      const createTxns = await this.onboardingClient.createHotspot({
        transaction,
      })
      solanaTransactions = createTxns.data?.solanaTransactions
    } catch (e) {
      this.writeError(e)
    }

    if (solanaTransactions?.length) {
      this.writeLog('Created hotspot onboard txns')
    } else {
      this.writeLog('Could not create hotspot onboard txns')
    }

    try {
      if (!solanaTransactions?.length) {
        throw new Error('No solana transactions returned from create hotspot')
      }

      this.writeLog('Submitting hotspot to solana')
      this.setProgressToStep('submit_create')
      const txnids = await this.solanaOnboarding.submitAll({
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

    if (this.shouldMock) {
      return this.solanaOnboarding.hotspotToAssetKey(hotspotAddress)
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
        const hotspotPubKey = await this.solanaOnboarding.hotspotToAssetKey(hotspotAddress)
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

    if (this.shouldMock) {
      return this.solanaOnboarding.getHotspotDetails({
        type: 'MOBILE',
        address: hotspotAddress,
      })
    }

    // We check if the mobile info exists up to 200 times
    // This equates to 600 seconds or 10 minutes
    for (let i = 0; i < 200; i++) {
      // waiting for the asset to be created on solana
      await sleep(3000)

      try {
        const hotspotInfo = await this.solanaOnboarding.getHotspotDetails({
          type: 'MOBILE',
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
  }: {
    addGatewayTxn: string
    authToken?: string
    location?: string
  }) => {
    const addGatewayV1 = AddGatewayV1.fromString(addGatewayTxn)
    if (!addGatewayV1.gateway) {
      throw new Error('invalid add_gateway_v1 txn string')
    }
    const hotspotAddress = addGatewayV1.gateway.b58

    if (authToken && this.cluster === 'devnet') {
      // If onboarding to devnet, we create the hotspot on the onboarding server
      try {
        await this.onboardingClient.addToOnboardingServer({
          onboardingKey: hotspotAddress,
          authToken,
        })
        await sleep(1000)
      } catch (e) {
        this.writeError(e)
      }
    }

    let hotspotPubKey: PublicKey | undefined
    try {
      hotspotPubKey = await this.solanaOnboarding.hotspotToAssetKey(hotspotAddress)
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
      const hotspotInfo = await this.solanaOnboarding.getHotspotDetails({
        type: 'MOBILE',
        address: hotspotAddress,
      })
      if (hotspotInfo) {
        needsOnboarding = false
      }
      this.writeLog(`Hotspot ${!!hotspotInfo ? 'has' : 'has not'} been onboarded to MOBILE`)
    } catch (e) {
      this.writeError(e)
    }

    if (!needsOnboarding) {
      return []
    }

    const txns = await this.getMobileOnboardTxns({
      location,
      hotspotAddress,
    })

    return txns
  }

  getHotspotAssetKey = async (hotspotAddress: string) => {
    return this.solanaOnboarding.hotspotToAssetKey(hotspotAddress)
  }

  onHotspotCreated = async (hotspotAddress: string) => {
    this.setProgressToStep('shutdown_wifi')
    const asset = await this.solanaOnboarding.hotspotToAssetKey(hotspotAddress)
    if (!asset) {
      this.writeLog('Hotspot asset not found')
      throw new Error('Hotspot Asset not found')
    }

    this.writeLog('Calling onHotspotCreated', { data: { asset: asset.toBase58() } })

    let shutdownSuccess = false
    try {
      shutdownSuccess = await this.wifiClient.onHotspotCreated({
        assetId: asset.toBase58(),
        cluster: this.cluster,
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
    this.setProgressToStep('submit_mobile')

    const asset = await this.solanaOnboarding.hotspotToAssetKey(hotspotAddress)
    if (!asset) {
      const err = new Error('Hotspot Asset not found')
      this.writeError(err)
      throw err
    }

    let txnIds: string[] = []
    if (signedTxns.length) {
      try {
        txnIds = await this.solanaOnboarding.submitAll({ txns: signedTxns })
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
      shutdownSuccess = await this.wifiClient.onHotspotCreated({
        assetId: asset.toBase58(),
        cluster: this.cluster,
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
    return this.solanaOnboarding.createTransferCompressedCollectableTxn({
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
    return this.solanaOnboarding.createTransferInstructions({
      newOwner,
      hotspotAddress,
    })
  }
}
