import snakecaseKeys from 'snakecase-keys'
import type Client from '../Client'
import Account, { AccountStats } from '../models/Account'
import type { HTTPAccountObject } from '../models/Account'
import ResourceList from '../ResourceList'

interface ListParams {
  cursor?: string
}

export default class Accounts {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  fromAddress(address: string): Account {
    return new Account(this.client, { address })
  }

  async list(params: ListParams = {}): Promise<ResourceList<Account>> {
    const url = '/accounts'
    const response = await this.client.get(url, { cursor: params.cursor })
    const { data: { data: accounts, cursor } } = response
    const data = accounts.map((d: HTTPAccountObject) => new Account(this.client, d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  async listRich(): Promise<ResourceList<Account>> {
    const url = '/accounts/rich'
    const response = await this.client.get(url)
    const {
      data: { data: accounts },
    } = response
    const data = accounts.map((d: HTTPAccountObject) => new Account(this.client, d))
    return new ResourceList(data, this.list.bind(this))
  }

  async get(address: string, params?: { maxBlock?: number }): Promise<Account> {
    const path = `/accounts/${address}`
    const {
      data: { data: account },
    } = await this.client.get(path, snakecaseKeys(params || {}))
    return new Account(this.client, account)
  }

  async getStats(address: string): Promise<AccountStats> {
    const url = `/accounts/${address}/stats`
    const { data: { data: stats } } = await this.client.get(url)
    return new AccountStats(stats)
  }
}
