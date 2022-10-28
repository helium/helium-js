import {
  BaseCurrencyType,
  DataCredits,
  IotTokens,
  MobileTokens,
  SolTokens,
  NetworkTokens,
  SecurityTokens,
  TestNetworkTokens,
  USDollars,
} from './currency_types'
import { UnsupportedTickerError } from './Errors'

export type AnyCurrencyType =
  | NetworkTokens
  | MobileTokens
  | SolTokens
  | IotTokens
  | TestNetworkTokens
  | SecurityTokens
  | DataCredits
  | USDollars

export default class CurrencyType {
  static fromTicker(ticker: string = 'HNT'): BaseCurrencyType {
    switch (ticker?.toUpperCase()) {
      case this.default.ticker:
        return this.default
      case this.security.ticker:
        return this.security
      case this.mobile.ticker:
        return this.mobile
      case this.iot.ticker:
        return this.iot
      case this.solTokens.ticker:
        return this.solTokens
      default:
        throw UnsupportedTickerError(ticker)
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

  static get solTokens(): SolTokens {
    return new SolTokens()
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
