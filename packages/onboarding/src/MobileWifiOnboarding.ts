import { AddGatewayV1 } from '@helium/transactions'
import WifiHttpClient from './WifiHttpClient'
import OnboardingClient from './OnboardingClient'
import SolanaOnboarding from './SolanaOnboarding'
import { Cluster, Connection, PublicKey } from '@solana/web3.js'
import { HotspotType } from './types'
import sleep from './sleep'

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
  private logCallback?: (message: string, data?: unknown) => void

  constructor(opts: {
    wifiBaseUrl: string
    onboardingClientUrl: string
    shouldMock?: boolean
    wallet: PublicKey
    rpcEndpoint: string
    cluster: Cluster
    errorCallback?: (e: unknown) => void
    logCallback?: (message: string, data?: unknown) => void
  }) {
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
  }

  writeError = (error: unknown) => {
    this.errorCallback?.(error)
  }

  writeLog = (message: string, data?: unknown) => {
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

  getAddGatewayTxn = async (payer: PublicKey) => {
    const txnStr = await this.wifiClient.getTxnFromGateway(payer)
    return AddGatewayV1.fromString(txnStr)
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

  getOnboardHotspotTxns = async ({
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
        `Failed to onboard gateway. Code: ${onboardTxns.code} - ${onboardTxns.errorMessage}`,
      )
      this.writeError(err)
      throw err
    }

    try {
      this.writeLog('Return solana transactions for onboarding')
      return onboardTxns.data.solanaTransactions
    } catch (e) {
      this.writeLog('Something went wrong with onboarding')
      this.writeError(e)
      return []
    }
  }

  createHotspot = async ({ transaction }: { transaction: string }) => {
    this.logCallback?.('Creating hotspot on Solana', { data: { transaction } })

    const createTxns = await this.onboardingClient.createHotspot({
      transaction,
    })

    if (createTxns.data?.solanaTransactions.length) {
      this.writeLog('Created hotspot', { data: createTxns })
    } else {
      this.writeLog('Did not create hotspot', { data: createTxns.data })
    }

    // NOTE: If there aren't any txns, it's possible this hotspot has already been created
    // Carry on and try to onboard
    try {
      if (createTxns?.data?.solanaTransactions.length) {
        this.writeLog('Submitting hotspot to solana')
        const txnids = await this.solanaOnboarding.submitAll({
          txns: createTxns.data.solanaTransactions.map((t) => Buffer.from(t)),
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

    if (authToken) {
      // TODO: Remove this 👇 for production
      await this.onboardingClient.addToOnboardingServer({
        onboardingKey: hotspotAddress,
        authToken,
      })
      // TODO: Remove this 👇 for production
      await sleep(1000)
    }

    let hotspotPubKey: PublicKey | undefined
    try {
      hotspotPubKey = await this.solanaOnboarding.hotspotKeyToAssetId(hotspotAddress)
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
            hotspotPubKey = await this.solanaOnboarding.hotspotKeyToAssetId(hotspotAddress)
          } catch (e) {
            this.writeError(e)
          }
        } else {
          await sleep(300)
        }
        this.updateProgress({ amountToIncrement: 3 })
      }
    }

    const txns = await this.getOnboardHotspotTxns({
      location,
      hotspotAddress,
    })

    this.updateProgress()

    return txns
  }

  submitAndCompleteOnboarding = async ({
    hotspotAddress,
    signedTxns,
  }: {
    hotspotAddress: string
    signedTxns: Buffer[]
  }) => {
    const txnIds = await this.solanaOnboarding.submitAll({ txns: signedTxns })

    let asset: PublicKey | undefined = undefined
    let attempts = 0
    // After create/onboard the hotspot can take a few seconds to become available for lookup
    while (!asset && attempts < MAX_ASSET_LOOKUP_COUNT) {
      this.writeLog(`Hotspot onboarded, try to get asset key. Attempt: ${attempts + 1}`)
      await sleep(1000)
      asset = await this.solanaOnboarding.hotspotKeyToAssetId(hotspotAddress)
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
