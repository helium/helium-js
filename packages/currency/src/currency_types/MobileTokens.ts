import BaseCurrencyType from './BaseCurrencyType'

const TICKER = 'MOBILE'

export default class MobileTokens extends BaseCurrencyType {
  constructor() {
    super(TICKER, 8)
  }
}
