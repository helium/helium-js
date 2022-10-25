import BaseCurrencyType from './BaseCurrencyType'

const TICKER = 'SOL'

export default class SolTokens extends BaseCurrencyType {
  constructor() {
    super(TICKER, 8)
  }
}
