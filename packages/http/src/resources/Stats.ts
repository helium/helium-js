import type Client from '../Client'
import camelcaseKeys from 'camelcase-keys'

export default class Stats {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  async get(): Promise<any> {
    const url = `/stats`
    const { data: { data: stats } } = await this.client.get(url)
    return camelcaseKeys(stats)
  }
}
