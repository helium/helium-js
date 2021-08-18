import camelcaseKeys from 'camelcase-keys'
import { Counts, DcBurns } from '../models/Stats'
import type Client from '../Client'

type Context = 'validators'

export default class Stats {
  private client!: Client

  private context?: Context

  constructor(client: Client, context?: Context) {
    this.client = client
    this.context = context
  }

  async get(): Promise<any> {
    let url = '/stats'
    if (this.context === 'validators') {
      url = '/validators/stats'
    }
    const {
      data: { data: stats },
    } = await this.client.get(url)
    return camelcaseKeys(stats, { deep: true })
  }

  async counts(): Promise<Counts> {
    const url = '/stats/counts'
    const {
      data: { data: stats },
    } = await this.client.get(url)
    return camelcaseKeys(stats) as Counts
  }

  async dcBurns(): Promise<DcBurns> {
    const url = '/dc_burns/stats'
    const {
      data: { data: stats },
    } = await this.client.get(url)
    return camelcaseKeys(stats, { deep: true }) as DcBurns
  }
}
