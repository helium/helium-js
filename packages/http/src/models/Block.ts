import type Client from '../Client'
import Transactions from '../resources/Transactions'

export interface HTTPBlockObject {
  transaction_count?: number
  time?: number
  prev_hash?: string
  height?: number
  hash?: string
}

export default class Block {
  private client: Client
  public height?: number
  public transactionCount?: number
  public time?: number
  public prevHash?: string
  public hash?: string

  constructor(client: Client, block: HTTPBlockObject) {
    this.client = client
    this.height = block.height
    this.transactionCount = block.transaction_count
    this.time = block.time
    this.prevHash = block.prev_hash
    this.hash = block.hash
  }

  public get transactions(): Transactions {
    return new Transactions(this.client, this)
  }
}
