import type Client from '../Client'
import Account from '../models/Account'
import type { HTTPAccountObject } from '../models/Account'

export default class Accounts {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  async list(): Promise<Array<Account>> {
    const { data: { data: accounts } } = await this.client.get('/accounts')
    return accounts.map((d: HTTPAccountObject) => new Account(this.client, d))
    // return new ResourceList(client, data, cursor, model, route)
  }

  async get(address: string): Promise<Account> {
    const { data: { data: account } } = await this.client.get(`/accounts/${address}`)
    return new Account(this.client, account)
  }
}
