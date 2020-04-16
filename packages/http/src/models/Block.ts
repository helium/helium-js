import type Client from '../Client'
import Transactions from '../resources/Transactions'

export interface HTTPBlockObject {
  transaction_count: number
  time: number
  prev_hash: string
  height: number
  hash: string
}

export default class Block {
  // private client: Client
  public transactionCount: number
  public time: number
  public prevHash: string
  public height: number
  public hash: string
  public transactions: Transactions

  constructor(client: Client, block: HTTPBlockObject) {
    // this.client = client

    this.transactionCount = block.transaction_count
    this.time = block.time
    this.prevHash = block.prev_hash
    this.height = block.height
    this.hash = block.hash

    this.transactions = new Transactions(client, { block: this })
  }
}
