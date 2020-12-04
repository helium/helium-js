import type Client from '../Client'
import Transactions from '../resources/Transactions'
import DataModel from './DataModel'

export interface HTTPBlockObject {
  transaction_count?: number
  time?: number
  prev_hash?: string
  height?: number
  hash?: string
}

export type BlockData = Omit<Block, 'client'>

export default class Block extends DataModel {
  private client: Client

  public height?: number

  public transactionCount?: number

  public time?: number

  public prevHash?: string

  public hash?: string

  constructor(client: Client, block: HTTPBlockObject) {
    super()
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

  get data(): BlockData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}
