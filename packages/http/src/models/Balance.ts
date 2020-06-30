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

export default class Balance {
  public integerBalance: number
  public floatBalance: number
  public type: CurrencyType
  private bigBalance: BigNumber

  constructor(integerBalance: number | undefined, type: CurrencyType) {
    this.integerBalance = integerBalance || 0
    this.bigBalance = new BigNumber(this.integerBalance)
    this.floatBalance = this.bigBalance.times(type.coefficient).toNumber()
    this.type = type
  }

  toString(maxDecimalPlaces?: number): string {
    const number = this.bigBalance.times(this.type.coefficient)
    let numberString = number.toFormat(maxDecimalPlaces)
    // if it's an integer, just show the integer
    if (parseInt(numberString.split('.')[1]) === 0) {
      numberString = numberString.split('.')[0]
    }
    // if the rounded amount is 0, then show the full amount
    if (numberString === '0') {
      numberString = number.toFormat()
    }
    return [
      numberString,
      this.type.ticker,
    ].join(' ')
  }
}
