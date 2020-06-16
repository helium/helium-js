import type Client from '../Client'
import camelcaseKeys from 'camelcase-keys'

export default class Vars {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  async get(): Promise<any> {
    const url = `/vars`
    const { data: { data: vars } } = await this.client.get(url)
    return camelcaseKeys(vars)
  }
}
