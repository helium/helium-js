import BigNumber from 'bignumber.js'

function makeCoefficient(decimalPlaces: BigNumber): BigNumber {
  const one = new BigNumber(1)
  const ten = new BigNumber(10)
  return one.dividedBy(ten.exponentiatedBy(decimalPlaces))
}

type CurrencyFormat = {
  showTrailingZeroes?: boolean
  decimalPlaces?: number
}

export type Ticker = 'SOL' | 'MOBILE' | 'HNT' | 'IOT' | 'DC' | 'TNT' | 'USD' | 'HST'

export default class BaseCurrencyType {
  public ticker: Ticker

  public decimalPlaces: BigNumber

  public coefficient: BigNumber

  public format?: CurrencyFormat

  constructor(ticker: Ticker, decimalPlaces: number, format?: CurrencyFormat) {
    this.ticker = ticker
    this.decimalPlaces = new BigNumber(decimalPlaces)
    this.coefficient = makeCoefficient(this.decimalPlaces)
    this.format = format
  }
}
