import {
  NetworkTokens,
  SecurityTokens,
  DataCredits,
  USDollars,
} from './currency_types'

export type AnyCurrencyType =
  | NetworkTokens
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
