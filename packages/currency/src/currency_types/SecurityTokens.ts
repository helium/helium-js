import BaseCurrencyType from './BaseCurrencyType'

const TICKER = 'HST'

export default class SecurityTokens extends BaseCurrencyType {
  constructor() {
    super(TICKER, 8)
  }
}
