import type Client from '../Client'
import Account from '../models/Account'
import type { HTTPAccountObject } from '../models/Account'
import { ResourceList } from '..'

interface ListParams {
  cursor?: string
}

export default class Accounts {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  async list(params: ListParams = {}): Promise<ResourceList> {
    const {
      data: { data: accounts, cursor },
    } = await this.client.get('/accounts', { cursor: params.cursor })
    const data = accounts.map(
      (d: HTTPAccountObject) => new Account(this.client, d),
    )
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  async get(address: string): Promise<Account> {
    const {
      data: { data: account },
    } = await this.client.get(`/accounts/${address}`)
    return new Account(this.client, account)
  }
}
