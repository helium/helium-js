import camelcaseKeys from 'camelcase-keys'
import { Counts } from '../models/Stats'
import type Client from '../Client'

export default class Stats {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  async get(): Promise<any> {
    const url = '/stats'
    const { data: { data: stats } } = await this.client.get(url)
    return camelcaseKeys(stats, { deep: true })
  }

  async counts() {
    const url = '/stats/counts'
    const { data: { data: stats } } = await this.client.get(url)
    return camelcaseKeys(stats) as Counts
  }
}
