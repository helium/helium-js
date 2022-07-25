import {
  BaseCurrencyType,
  DataCredits,
  IotTokens,
  MobileTokens,
  NetworkTokens,
  SecurityTokens,
  TestNetworkTokens,
  USDollars,
} from './currency_types'

export type AnyCurrencyType =
  | NetworkTokens
  | MobileTokens
  | IotTokens
  | TestNetworkTokens
  | SecurityTokens
  | DataCredits
  | USDollars

export default class CurrencyType {
  static fromTicker(ticker?: string): BaseCurrencyType {
    switch (ticker?.toUpperCase()) {
      default:
      case this.default.ticker:
        return this.default
      case this.security.ticker:
        return this.security
      case this.mobile.ticker:
        return this.mobile
      case this.iot.ticker:
        return this.iot
    }
  }

  static get default(): NetworkTokens {
    return new NetworkTokens()
  }

  static get networkToken(): NetworkTokens {
    return new NetworkTokens()
  }

  static get mobile(): MobileTokens {
    return new MobileTokens()
  }

  static get iot(): IotTokens {
    return new IotTokens()
  }

  static get testNetworkToken(): TestNetworkTokens {
    return new TestNetworkTokens()
  }

  static get dataCredit(): DataCredits {
    return new DataCredits()
  }

  static get security(): SecurityTokens {
    return new SecurityTokens()
  }

  static get usd(): USDollars {
    return new USDollars()
  }
}
