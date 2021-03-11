import { Balance, CurrencyType, USDollars } from '@helium/currency'
import type Client from '../Client'

interface HTTPOraclePrice {
  price: number
  height?: number
  time?: number
}

export interface OraclePrice {
  price: Balance<USDollars>
  height?: number
  time?: number
}

export default class Oracle {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  async getCurrentPrice(): Promise<OraclePrice> {
    const url = '/oracle/prices/current'
    const { data: { data: { price, block } } } = await this.client.get(url)

    return { price: new Balance(price, CurrencyType.usd), height: block }
  }

  async getPriceAtBlock(height: number): Promise<OraclePrice> {
    const url = `/oracle/prices/${height}`
    const { data: { data: { price, block } } } = await this.client.get(url)

    return { price: new Balance(price, CurrencyType.usd), height: block }
  }

  async getPredictedPrice(): Promise<OraclePrice[]> {
    const url = '/oracle/predictions'
    const response = await this.client.get(url)
    if (!response.data.data || !response.data.data.length) {
      return []
    }

    const { data: { data: predictions } } = response
    return predictions.map((prediction: HTTPOraclePrice) => ({
      time: prediction.time,
      price: new Balance(prediction.price, CurrencyType.usd),
    }))
  }
}
