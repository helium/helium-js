import BaseCurrencyType from './BaseCurrencyType'

const TICKER = 'HNT'

export default class NetworkTokens extends BaseCurrencyType {
  constructor() {
    super(TICKER, 8)
  }
}
