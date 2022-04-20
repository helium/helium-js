import BaseCurrencyType from './BaseCurrencyType'

const TICKER = 'DC'

export default class DataCredits extends BaseCurrencyType {
  constructor() {
    super(TICKER, 0)
  }
}
