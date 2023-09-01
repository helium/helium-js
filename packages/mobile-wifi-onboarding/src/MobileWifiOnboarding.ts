import { AddGatewayV1 } from '@helium/transactions'
import WifiHttpClient from './WifiHttpClient'

export default class MobileWifiOnboarding {
  private wifiClient!: WifiHttpClient

  constructor(opts: {
    wifiBaseUrl: string
    shouldMock?: boolean
    ownerHeliumAddress: string
    payerHeliumAddress: string
  }) {
    this.wifiClient = new WifiHttpClient({
      ...opts,
      baseURL: opts.wifiBaseUrl,
      mockRequests: opts.shouldMock,
    })
  }

  getAddGatewayTxn = async () => {
    const txnStr = await this.wifiClient.getTxnFromGateway()

    return AddGatewayV1.fromString(txnStr)
  }
}
