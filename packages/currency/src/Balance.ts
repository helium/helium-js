import BigNumber from 'bignumber.js'
import CurrencyType, { AnyCurrencyType } from './CurrencyType'
import {
  NetworkTokens,
  MobileTokens,
  USDollars,
  DataCredits,
  BaseCurrencyType,
  TestNetworkTokens,
} from './currency_types'
import {
  MixedCurrencyTypeError,
  OraclePriceRequiredError,
  UnsupportedCurrencyConversionError,
} from './Errors'

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

type StringFormatOptions = {
  decimalSeparator?: string,
  groupSeparator?: string,
  showTicker?: boolean
}

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

  static fromFloat(float: number, currencyType: AnyCurrencyType) {
    const bigFloat = new BigNumber(float)
    const integerBalance = bigFloat.dividedBy(currencyType.coefficient).toNumber()
    return new Balance(integerBalance, currencyType)
  }

  toString(maxDecimalPlaces?: number, options?: StringFormatOptions): string {
    const decimalSeparator = options?.decimalSeparator || '.'
    const groupSeparator = options?.groupSeparator || ','
    const showTicker = options?.showTicker === undefined ? true : options.showTicker

    let numberString = maxDecimalPlaces !== undefined && maxDecimalPlaces !== null
      ? this.bigBalance.toFormat(
        maxDecimalPlaces,
        { decimalSeparator, groupSeparator, groupSize: 3 },
      )
      : this.bigBalance.toFormat({ decimalSeparator, groupSeparator, groupSize: 3 })
    // if it's an integer, just show the integer
    if (parseInt(numberString.split(decimalSeparator)[1], 10) === 0) {
      [numberString] = numberString.split(decimalSeparator)
    }
    // if the rounded amount is 0, then show the full amount
    if (numberString === '0') {
      numberString = this.bigBalance.toFormat({ decimalSeparator, groupSeparator })
    }
    return showTicker ? [numberString, this.type.ticker].join(' ') : numberString
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

  toNetworkTokens(hntOraclePrice?: Balance<USDollars>, mobileOraclePrice?: Balance<USDollars>):
  Balance<NetworkTokens> {
    if (this.type instanceof NetworkTokens) return this
    if (!hntOraclePrice) throw OraclePriceRequiredError

    if (this.type instanceof MobileTokens) {
      if (!mobileOraclePrice) throw OraclePriceRequiredError

      const usd = this.toUsd(mobileOraclePrice)
      return usd.toNetworkTokens(hntOraclePrice)
    }

    return new Balance(
      this.toUsd()
        .bigBalance.dividedBy(hntOraclePrice.bigBalance)
        .dividedBy(CurrencyType.networkToken.coefficient)
        .toNumber(),
      CurrencyType.networkToken,
    )
  }

  toTestNetworkTokens(tntOraclePrice?: Balance<USDollars>, mobileOraclePrice?: Balance<USDollars>):
  Balance<TestNetworkTokens> {
    if (this.type instanceof TestNetworkTokens) return this
    if (!tntOraclePrice) throw OraclePriceRequiredError

    if (this.type instanceof MobileTokens) {
      if (!mobileOraclePrice) throw OraclePriceRequiredError

      const usd = this.toUsd(mobileOraclePrice)
      return usd.toTestNetworkTokens(tntOraclePrice)
    }

    return new Balance(
      this.toUsd()
        .bigBalance.dividedBy(tntOraclePrice.bigBalance)
        .dividedBy(CurrencyType.testNetworkToken.coefficient)
        .toNumber(),
      CurrencyType.testNetworkToken,
    )
  }

  toUsd(oraclePrice?: Balance<USDollars>): Balance<USDollars> {
    if (this.type instanceof USDollars) return this
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

    if (this.type instanceof MobileTokens) {
      if (!oraclePrice) throw OraclePriceRequiredError
      return new Balance(
        this.bigBalance
          .times(oraclePrice.bigBalance)
          .dividedBy(CurrencyType.mobileToken.coefficient)
          .toNumber(),
        CurrencyType.usd,
      )
    }

    throw UnsupportedCurrencyConversionError
  }

  toDataCredits(oraclePrice?: Balance<USDollars>): Balance<DataCredits> {
    if (this.type instanceof DataCredits) return this
    if (this.type instanceof USDollars) {
      return new Balance(
        this.bigBalance.dividedBy(DC_TO_USD_MULTIPLIER).toNumber(),
        CurrencyType.dataCredit,
      )
    }
    if (this.type instanceof NetworkTokens) {
      if (!oraclePrice) throw OraclePriceRequiredError
      return this.toUsd(oraclePrice).toDataCredits()
    }

    throw UnsupportedCurrencyConversionError
  }
}
