import BaseCurrencyType from './BaseCurrencyType'

const TICKER = 'TNT'

export default class TestNetworkTokens extends BaseCurrencyType {
  constructor() {
    super(TICKER, 8)
  }
}
