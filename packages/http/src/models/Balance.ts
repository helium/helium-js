import BigNumber from 'bignumber.js'
import CurrencyType from './CurrencyType'

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

export default class Balance {
  public integerBalance: number
  public floatBalance: number
  public type: CurrencyType
  public bigBalance: BigNumber

  constructor(integerBalance: number | undefined, type: CurrencyType) {
    this.integerBalance = integerBalance || 0
    this.bigBalance = new BigNumber(this.integerBalance)
    this.floatBalance = this.bigBalance.times(type.coefficient).toNumber()
    this.type = type
    this.bigBalance = new BigNumber(this.integerBalance).times(type.coefficient)
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

  toDefault(oraclePrice?: Balance): Balance {
    if (this.type.ticker === 'HNT') return this
    if (!oraclePrice) throw 'oracle price required'
    return new Balance(
      this.toUsd()
        .bigBalance.dividedBy(oraclePrice.bigBalance)
        .dividedBy(CurrencyType.default.coefficient)
        .toNumber(),
      CurrencyType.default,
    )
  }

  toUsd(oraclePrice?: Balance): Balance {
    switch (this.type.ticker) {
      case 'DC':
        return new Balance(
          this.bigBalance
            .times(DC_TO_USD_MULTIPLIER)
            .dividedBy(CurrencyType.usd.coefficient)
            .toNumber(),
          CurrencyType.usd,
        )
      case 'HNT':
        if (!oraclePrice) throw 'oracle price required'
        return new Balance(
          this.bigBalance
            .times(oraclePrice.bigBalance)
            .dividedBy(CurrencyType.usd.coefficient)
            .toNumber(),
          CurrencyType.usd,
        )
      default:
        return this
    }
  }

  toDataCredit(oraclePrice?: Balance): Balance {
    switch (this.type.ticker) {
      case 'USD':
        return new Balance(
          this.bigBalance.dividedBy(DC_TO_USD_MULTIPLIER).toNumber(),
          CurrencyType.dataCredit,
        )
      case 'HNT':
        if (!oraclePrice) throw 'oracle price required'
        return this.toUsd(oraclePrice).toDataCredit()
      default:
        return this
    }
  }
}
