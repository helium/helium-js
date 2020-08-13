import type Client from '../Client'
import Account from '../models/Account'
import PendingTransaction, { HTTPPendingTransactionObject } from '../models/PendingTransaction'
import ResourceList from '../ResourceList'

type Context = Account

export default class PendingTransactions {
  private client!: Client

  private context?: Context

  constructor(client: Client, context?: Context) {
    this.client = client
    this.context = context
  }

  async get(hash: string): Promise<ResourceList<PendingTransaction>> {
    const url = `/pending_transactions/${hash}`
    const response = await this.client.get(url)
    const { data: { data: txns } } = response
    const data = txns.map((d: HTTPPendingTransactionObject) => new PendingTransaction(d))
    return new ResourceList(data)
  }

  async list(): Promise<ResourceList<PendingTransaction>> {
    if (this.context instanceof Account) {
      return this.listFromAccount()
    }
    throw new Error('Must provide an account to list pending transactions from')
  }

  private async listFromAccount(): Promise<ResourceList<PendingTransaction>> {
    const account = this.context as Account
    const url = `/accounts/${account.address}/pending_transactions`
    const response = await this.client.get(url)
    const { data: { data: txns } } = response
    const data = txns.map((d: HTTPPendingTransactionObject) => new PendingTransaction(d))
    return new ResourceList(data)
  }
}
