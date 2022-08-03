import BaseCurrencyType from './BaseCurrencyType'

const TICKER = 'USD'

export default class USDollars extends BaseCurrencyType {
  // N.B. on the Helium blockchain, USD is represented
  // with 8 decimal places
  constructor() {
    super(TICKER, 8, { decimalPlaces: 2, showTrailingZeroes: true })
  }
}
