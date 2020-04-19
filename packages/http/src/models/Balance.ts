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
  public type: CurrencyType
  private bigBalance: BigNumber

  constructor(integerBalance: number | undefined, type: CurrencyType) {
    this.integerBalance = integerBalance || 0
    this.bigBalance = new BigNumber(this.integerBalance)
    this.type = type
  }

  toString(maxDecimalPlaces?: number): string {
    const number = this.bigBalance.times(this.type.coefficient)
    let numberString = number.toFormat(maxDecimalPlaces)
    if (parseInt(numberString.split('.')[1]) === 0) {
      numberString = numberString.split('.')[0]
    }
    return [
      numberString,
      this.type.ticker,
    ].join( ' ')
  }
}
