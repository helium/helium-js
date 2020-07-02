import type Client from '../Client'
import Balance from '../models/Balance'
import CurrencyType from '../models/CurrencyType'

export default class Oracle {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  async getCurrentPrice(): Promise<any> {
    const url = `/oracle/prices/current`
    const { data: { data: { price } } } = await this.client.get(url)
    
    return new Balance(price, CurrencyType.usd)
  }
}
