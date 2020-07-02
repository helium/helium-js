import BigNumber from 'bignumber.js'
const TICKER = 'HNT'
const DC_TICKER = 'DC'
const SEC_TICKER = 'STO'
const USD = 'USD'

export default class CurrencyType {
  public ticker: string
  public coefficient: BigNumber

  constructor(ticker: string, coefficient: number) {
    this.ticker = ticker
    this.coefficient = new BigNumber(coefficient)
  }

  static get default(): CurrencyType {
    return new CurrencyType(TICKER, 0.00000001)
  }

  static get dataCredit(): CurrencyType {
    return new CurrencyType(DC_TICKER, 1)
  }

  static get security(): CurrencyType {
    return new CurrencyType(SEC_TICKER, 0.00000001)
  }

  static get usd(): CurrencyType {
    return new CurrencyType(USD, 0.00000001)
  }
}
