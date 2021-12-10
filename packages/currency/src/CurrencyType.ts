import {
  NetworkTokens,
  SecurityTokens,
  DataCredits,
  USDollars, TestNetworkTokens,
} from './currency_types'

export type AnyCurrencyType =
  | NetworkTokens
  | TestNetworkTokens
  | SecurityTokens
  | DataCredits
  | USDollars

export default class CurrencyType {
  static get default(): NetworkTokens {
    return new NetworkTokens()
  }

  static get networkToken(): NetworkTokens {
    return new NetworkTokens()
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
