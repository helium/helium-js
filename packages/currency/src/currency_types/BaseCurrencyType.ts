import BigNumber from 'bignumber.js'

function makeCoefficient(decimalPlaces: BigNumber): BigNumber {
  const one = new BigNumber(1)
  const ten = new BigNumber(10)
  return one.dividedBy(ten.exponentiatedBy(decimalPlaces))
}

export default class BaseCurrencyType {
  public ticker: string
  public decimalPlaces: BigNumber
  public coefficient: BigNumber

  constructor(ticker: string, decimalPlaces: number) {
    this.ticker = ticker
    this.decimalPlaces = new BigNumber(decimalPlaces)
    this.coefficient = makeCoefficient(this.decimalPlaces)
  }
}
