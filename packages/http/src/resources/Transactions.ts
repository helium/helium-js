import type Client from '../Client'
import type Block from '../models/Block'
import type Account from '../models/Account'
import Transaction from '../models/Transaction'
import PendingTransaction from '../models/PendingTransaction'

interface TransactionContext {
  block?: Block
  account?: Account
}

export default class Transactions {
  private client!: Client
  private block?: Block
  private account?: Account

  constructor(client: Client, { block, account }: TransactionContext = {}) {
    this.client = client
    this.block = block
    this.account = account
  }

  async submit(txn: String): Promise<PendingTransaction> {
    const { data: { data } } = await this.client.post('/pending_transactions', { txn })
    return new PendingTransaction(data)
  }

  async list(): Promise<Array<Transaction>> {
    if (this.block) {
      return this.listFromBlock()
    }
    if (this.account) {
      // return this.listFromBlock()
    }
    throw new Error('not implemented')
  }

  private async listFromBlock(): Promise<Array<Transaction>> {
    this.client.get(`/blocks/${this.block?.height}/transactions`)
    const { data: { data: txns } } = await this.client.get('/blocks')
    return txns.map((d: object) => new Transaction(this.client, d))
  }
}
