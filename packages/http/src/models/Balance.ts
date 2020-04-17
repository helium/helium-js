import CurrencyType from './CurrencyType'

export default class Balance {
  public integerBalance: number
  public type: CurrencyType

  constructor(integerBalance: number, type: CurrencyType) {
    this.integerBalance = integerBalance
    this.type = type
  }

  toString(): string {
    return [
      this.integerBalance * this.type.coefficient,
      this.type.ticker,
    ].join( ' ')
  }
}
