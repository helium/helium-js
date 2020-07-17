import type Client from '../Client'
import Balance from '../models/Balance'
import CurrencyType from '../models/CurrencyType'

export default class Oracle {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  async getCurrentPrice(): Promise<any> {
    const url = '/oracle/prices/current'
    const { data: { data: { price, block } } } = await this.client.get(url)

    return { price: new Balance(price, CurrencyType.usd), height: block }
  }

  async getPriceAtBlock(height: number): Promise<any> {
    const url = `/oracle/prices/${height}`
    const { data: { data: { price, block } } } = await this.client.get(url)

    return { price: new Balance(price, CurrencyType.usd), height: block }
  }

  async getPredictedPrice(): Promise<any> {
    const url = '/oracle/predictions'
    const response = await this.client.get(url)
    if (!response.data.data || !response.data.data.length) {
      return []
    }

    const { data: { data: [{ price, time }] } } = response
    return { price: new Balance(price, CurrencyType.usd), time }
  }
}
