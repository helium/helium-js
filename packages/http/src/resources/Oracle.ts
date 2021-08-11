import OraclePrice, { HTTPOraclePrice } from '../models/OraclePrice'
import OraclePricePrediction, { HTTPOraclePricePrediction } from '../models/OraclePricePrediction'
import ResourceList from '../ResourceList'
import type Client from '../Client'

interface ListParams {
  cursor?: string
}

export default class Oracle {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  async getCurrentPrice(): Promise<OraclePrice> {
    const url = '/oracle/prices/current'
    const {
      data: { data },
    } = await this.client.get(url)
    return new OraclePrice(this.client, data)
  }

  async listPrices(params: ListParams = {}): Promise<ResourceList<OraclePrice>> {
    const {
      data: { data: prices, cursor },
    } = await this.client.get('/oracle/prices', { cursor: params.cursor })
    const data = prices.map((d: HTTPOraclePrice) => new OraclePrice(this.client, d))
    return new ResourceList(data, this.listPrices.bind(this), cursor)
  }

  async getPriceAtBlock(height: number): Promise<OraclePrice> {
    const url = `/oracle/prices/${height}`
    const {
      data: { data },
    } = await this.client.get(url)
    return new OraclePrice(this.client, data)
  }

  async getPredictedPrice(): Promise<OraclePricePrediction[]> {
    const url = '/oracle/predictions'
    const response = await this.client.get(url)
    if (!response.data.data || !response.data.data.length) {
      return []
    }

    const {
      data: { data: predictions },
    } = response
    return predictions.map(
      (prediction: HTTPOraclePricePrediction) => new OraclePricePrediction(this.client, prediction),
    )
  }
}
