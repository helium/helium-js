import type Client from '../Client'
import type Block from '../models/Block'
import Transaction from '../models/Transaction'

export default class Transactions {
  private client!: Client
  private block?: Block

  constructor(client: Client, block?: Block) {
    this.client = client
    this.block = block
  }

  submit(txn: String) {
    this.client.post('/pending_transactions', { txn })
  }

  async list(): Promise<Array<Transaction>> {
    if (this.block) {
      return this.listFromBlock()
    }
    throw new Error('not implemented')
  }

  private async listFromBlock(): Promise<Array<Transaction>> {
    this.client.get(`/blocks/${this.block?.height}/transactions`)
    const { data: { data: txns } } = await this.client.get('/blocks')
    return txns.map((d: object) => new Transaction(this.client, d))
  }
}
