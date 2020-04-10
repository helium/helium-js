import type Client from './Client'

export default class Transactions {
  public client!: Client

  constructor(client: Client) {
    this.client = client
  }

  submit(txn: String) {
    this.client.post('/pending_transactions', { txn })
  }
}
