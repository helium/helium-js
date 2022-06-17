import BaseCurrencyType from './BaseCurrencyType'

const TICKER = 'IOT'

export default class IotTokens extends BaseCurrencyType {
  constructor() {
    super(TICKER, 8)
  }
}
