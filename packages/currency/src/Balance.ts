import BigNumber from 'bignumber.js'
import CurrencyType from './CurrencyType'
import {
  NetworkTokens,
  USDollars,
  DataCredits,
  BaseCurrencyType,
} from './currency_types'
import { MixedCurrencyTypeError, OraclePriceRequiredError } from './Errors'

const FORMAT = {
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
}

BigNumber.config({
  EXPONENTIAL_AT: [-10, 20],
  FORMAT,
})

const DC_TO_USD_MULTIPLIER = 0.00001

export default class Balance<T extends BaseCurrencyType> {
  public type: T
  public integerBalance: number
  public floatBalance: number
  public bigBalance: BigNumber
  public bigInteger: BigNumber

  constructor(integerBalance: number | undefined, type: T) {
    this.type = type
    this.integerBalance = integerBalance || 0
    this.bigInteger = new BigNumber(this.integerBalance)
    this.bigBalance = this.bigInteger.times(type.coefficient)
    this.floatBalance = this.bigBalance.toNumber()
  }

  toString(maxDecimalPlaces?: number): string {
    let numberString = this.bigBalance.toFormat(maxDecimalPlaces)
    // if it's an integer, just show the integer
    if (parseInt(numberString.split('.')[1]) === 0) {
      numberString = numberString.split('.')[0]
    }
    // if the rounded amount is 0, then show the full amount
    if (numberString === '0') {
      numberString = this.bigBalance.toFormat()
    }
    return [numberString, this.type.ticker].join(' ')
  }

  plus(balance: Balance<T>): Balance<T> {
    if (this.type.ticker !== balance.type.ticker) throw MixedCurrencyTypeError
    return new Balance(
      this.bigInteger.plus(balance.bigInteger).toNumber(),
      this.type,
    )
  }

  minus(balance: Balance<T>): Balance<T> {
    if (this.type.ticker !== balance.type.ticker) throw MixedCurrencyTypeError
    return new Balance(
      this.bigInteger.minus(balance.bigInteger).toNumber(),
      this.type,
    )
  }

  times(n: number): Balance<T> {
    return new Balance(this.bigInteger.times(n).toNumber(), this.type)
  }

  dividedBy(n: number): Balance<T> {
    return new Balance(this.bigInteger.dividedBy(n).toNumber(), this.type)
  }

  toDefault(oraclePrice?: Balance<T>): Balance<NetworkTokens> {
    if (this.type instanceof NetworkTokens) return this
    if (!oraclePrice) throw OraclePriceRequiredError
    return new Balance(
      this.toUsd()
        .bigBalance.dividedBy(oraclePrice.bigBalance)
        .dividedBy(CurrencyType.default.coefficient)
        .toNumber(),
      CurrencyType.default,
    )
  }

  toUsd(oraclePrice?: Balance<T>): Balance<USDollars> {
    if (this.type instanceof DataCredits) {
      return new Balance(
        this.bigBalance
          .times(DC_TO_USD_MULTIPLIER)
          .dividedBy(CurrencyType.usd.coefficient)
          .toNumber(),
        CurrencyType.usd,
      )
    }
    if (this.type instanceof NetworkTokens) {
      if (!oraclePrice) throw OraclePriceRequiredError
      return new Balance(
        this.bigBalance
          .times(oraclePrice.bigBalance)
          .dividedBy(CurrencyType.usd.coefficient)
          .toNumber(),
        CurrencyType.usd,
      )
    }
    return this
  }

  toDataCredit(oraclePrice?: Balance<T>): Balance<DataCredits> {
    if (this.type instanceof USDollars) {
      return new Balance(
        this.bigBalance.dividedBy(DC_TO_USD_MULTIPLIER).toNumber(),
        CurrencyType.dataCredit,
      )
    }
    if (this.type instanceof NetworkTokens) {
      if (!oraclePrice) throw OraclePriceRequiredError
      return this.toUsd(oraclePrice).toDataCredit()
    }
    return this
  }
}
