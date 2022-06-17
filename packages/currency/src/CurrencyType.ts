import { TokenType } from '@helium/transactions'
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
  static fromTokenType(type: TokenType): BaseCurrencyType {
    switch (type) {
      default:
      case TokenType.hnt:
        return this.default
      case TokenType.hst:
        return this.security
      case TokenType.mobile:
        return this.mobileToken
      case TokenType.iot:
        return this.iotToken
    }
  }

  static get default(): NetworkTokens {
    return new NetworkTokens()
  }

  static get networkToken(): NetworkTokens {
    return new NetworkTokens()
  }

  static get mobileToken(): MobileTokens {
    return new MobileTokens()
  }

  static get iotToken(): IotTokens {
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
