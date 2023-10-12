import { AddGatewayV1 } from '@helium/transactions'
import WifiHttpClient from './WifiHttpClient'
import OnboardingClient from './OnboardingClient'
import SolanaOnboarding from './SolanaOnboarding'
import { Cluster, Connection, PublicKey } from '@solana/web3.js'
import { HotspotType } from './types'
import sleep from './sleep'
import { compareVersions } from 'compare-versions'

const MAX_ASSET_LOOKUP_COUNT = 30
const EXTRA_ASSET_CREATION_TIME_IN_SECONDS = 60
const ONBOARDING_STEPS = MAX_ASSET_LOOKUP_COUNT + EXTRA_ASSET_CREATION_TIME_IN_SECONDS + 4

export default class MobileWifiOnboarding {
  private wifiClient!: WifiHttpClient
  private onboardingClient!: OnboardingClient
  private solanaOnboarding!: SolanaOnboarding
  private currentStep = 0
  private progressCallback?: (progress: number) => void
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
  }) {
    this.wallet = opts.wallet
    this.cluster = opts.cluster
    this.rpcEndpoint = opts.rpcEndpoint
    this.wifiBaseUrl = opts.wifiBaseUrl
    this.onboardingClientUrl = opts.onboardingClientUrl
    this.shouldMock = opts.shouldMock || false

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

  private updateProgress = (opts?: { newValue?: number; amountToIncrement?: number }) => {
    const { newValue, amountToIncrement } = opts || {}
    if (newValue !== undefined) {
      this.currentStep = newValue
    } else if (amountToIncrement !== undefined) {
      this.currentStep = this.currentStep + amountToIncrement
    } else {
      this.currentStep = this.currentStep + 1
    }

    if (this.progressCallback) {
      this.progressCallback(this.currentStep / ONBOARDING_STEPS)
    }
  }

  getAddGatewayTxn = async () => {
    const txnStr = await this.wifiClient.getTxnFromGateway()
    return AddGatewayV1.fromString(txnStr)
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

  getAssertData = async ({
    gateway,
    decimalGain,
    elevation,
    location,
    hotspotTypes,
    maker,
  }: {
    gateway: string
    decimalGain?: number
    elevation?: number
    location: string
    hotspotTypes: HotspotType[]
    maker: PublicKey
  }) => {
    return this.solanaOnboarding.getAssertData({
      gateway,
      decimalGain,
      elevation,
      location,
      hotspotTypes,
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
    this.writeLog('Onboarding hotspot to MOBILE network')

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

    let solanaTransactions: number[][] | undefined = undefined
    try {
      const createTxns = await this.onboardingClient.createHotspot({
        transaction,
      })
      solanaTransactions = createTxns.data?.solanaTransactions
    } catch (e) {
      this.writeError(encodeURI)
    }

    if (solanaTransactions?.length) {
      this.writeLog('Created hotspot onboard txns', solanaTransactions)
    } else {
      this.writeLog('Could not create hotspot onboard txns')
    }

    // NOTE: If there aren't any txns, it's possible this hotspot has already been created
    // Carry on and try to onboard
    try {
      if (solanaTransactions?.length) {
        this.writeLog('Submitting hotspot to solana')
        const txnids = await this.solanaOnboarding.submitAll({
          txns: solanaTransactions.map((t) => Buffer.from(t)),
        })
        this.writeLog('Hotspot has successfully been submitted to solana', { data: txnids })
        return txnids
      }
    } catch (e) {
      this.writeError(e)
    }
    return []
  }

  createHotspotGetOnboardTxns = async ({
    addGatewayTxn,
    progressCallback,
    authToken,
    location,
  }: {
    addGatewayTxn: string
    progressCallback?: (progress: number) => void
    authToken?: string
    location?: string
  }) => {
    this.progressCallback = progressCallback
    this.updateProgress({ newValue: 0 })

    const addGatewayV1 = AddGatewayV1.fromString(addGatewayTxn)
    if (!addGatewayV1.gateway) {
      throw new Error('invalid add_gateway_v1 txn string')
    }
    const hotspotAddress = addGatewayV1.gateway.b58

    if (authToken && this.cluster === 'devnet') {
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

    this.updateProgress()

    if (hotspotPubKey) {
      this.updateProgress({
        amountToIncrement: EXTRA_ASSET_CREATION_TIME_IN_SECONDS,
      })
    } else {
      await this.createHotspot({
        transaction: addGatewayTxn,
      })

      // sometimes create hotspot takes a really long time and solana can't
      // confirm that is was successfully created. This is a hacky way
      // to verify the asset was created. Every 3 seconds, we check to see
      // if the asset exists. If it does, we stop checking.
      for (let i = 0; i < EXTRA_ASSET_CREATION_TIME_IN_SECONDS / 3; i++) {
        if (!hotspotPubKey) {
          // waiting for the asset to be created on solana
          await sleep(3000)
          try {
            hotspotPubKey = await this.solanaOnboarding.hotspotToAssetKey(hotspotAddress)
            this.writeLog(`Hotspot asset found?: ${hotspotPubKey?.toBase58()} ${hotspotAddress}`)
          } catch (e) {
            this.writeError(e)
          }
        } else {
          await sleep(300)
        }
        this.updateProgress({ amountToIncrement: 3 })
      }
    }

    const txns = await this.getMobileOnboardTxns({
      location,
      hotspotAddress,
    })

    this.updateProgress()

    return txns
  }

  getHotspotAssetKey = async (hotspotAddress: string) => {
    return this.solanaOnboarding.hotspotToAssetKey(hotspotAddress)
  }

  onHotspotCreated = async (hotspotAddress: string) => {
    const asset = await this.solanaOnboarding.hotspotToAssetKey(hotspotAddress)
    if (!asset) {
      this.writeLog('Hotspot asset not found')
      throw new Error('Hotspot Asset not found')
    }
    return this.wifiClient.onHotspotCreated(asset.toBase58())
  }

  submitAndCompleteOnboarding = async ({
    hotspotAddress,
    signedTxns,
  }: {
    hotspotAddress: string
    signedTxns: Buffer[]
  }) => {
    this.writeLog('Submitting MOBILE onboard txns to solana', {
      signedTxns,
    })
    let txnIds: string[] = []
    try {
      txnIds = await this.solanaOnboarding.submitAll({ txns: signedTxns })
    } catch (e) {
      this.writeError(e)
      throw e
    }

    this.writeLog('Finished submitting onboarding txns to solana', {
      txnIds,
    })

    if (!txnIds.length) {
      this.writeError('No txnIds returned from solana submission')
    }

    this.updateProgress()

    let asset: PublicKey | undefined = undefined
    let attempts = 0
    // After create/onboard the hotspot can take a few seconds to become available for lookup
    while (!asset && attempts < MAX_ASSET_LOOKUP_COUNT) {
      this.writeLog(`Hotspot onboarded to MOBILE, try to get asset key. Attempt: ${attempts + 1}`)
      await sleep(1000)
      asset = await this.solanaOnboarding.hotspotToAssetKey(hotspotAddress)
      attempts = attempts + 1
      this.updateProgress()
    }
    this.updateProgress({ newValue: ONBOARDING_STEPS - 1 })
    if (!asset) {
      this.writeLog('Hotspot asset not found')
      throw new Error('Hotspot Asset not found')
    }
    await this.wifiClient.onHotspotCreated(asset.toBase58())
    this.updateProgress({ newValue: ONBOARDING_STEPS })
    return { txnIds }
  }
}
