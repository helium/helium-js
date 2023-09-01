import { AddGatewayV1 } from '@helium/transactions'
import WifiHttpClient from './WifiHttpClient'
import OnboardingClient, { HotspotType } from '@helium/onboarding'
import Solana from './Solana'
import { Connection } from '@solana/web3.js'

export default class MobileWifiOnboarding {
  private wifiClient!: WifiHttpClient
  private onboardingClient!: OnboardingClient
  private solana!: Solana

  constructor(opts: {
    wifiBaseUrl: string
    onboardingClientUrl: string
    shouldMock?: boolean
    ownerHeliumAddress: string
    makerHeliumAddress: string
    rpcEndpoint: string
  }) {
    this.wifiClient = new WifiHttpClient({
      payerHeliumAddress: opts.makerHeliumAddress,
      ownerHeliumAddress: opts.ownerHeliumAddress,
      baseURL: opts.wifiBaseUrl,
      mockRequests: opts.shouldMock,
    })
    this.onboardingClient = new OnboardingClient(opts.onboardingClientUrl)
    this.solana = new Solana({
      onboardingClient: this.onboardingClient,
      shouldMock: opts.shouldMock,
      heliumWalletAddress: opts.ownerHeliumAddress,
      makerHeliumWalletAddress: opts.makerHeliumAddress,
      connection: new Connection(opts.rpcEndpoint),
    })
  }

  getAddGatewayTxn = async () => {
    const txnStr = await this.wifiClient.getTxnFromGateway()

    return AddGatewayV1.fromString(txnStr)
  }

  getAssertData = async ({
    gateway,
    decimalGain,
    elevation,
    location,
    hotspotTypes,
  }: {
    gateway: string
    decimalGain?: number
    elevation?: number
    location: string
    hotspotTypes: HotspotType[]
  }) => {
    return this.solana.getAssertData({ gateway, decimalGain, elevation, location, hotspotTypes })
  }
}
