import type Client from '../Client'
import type { AnyTransaction, TxnJsonObject } from '../models/Transaction'
import Block from '../models/Block'
import Account from '../models/Account'
import Transaction from '../models/Transaction'
import PendingTransaction from '../models/PendingTransaction'
import ResourceList from '../ResourceList'
import Hotspot from '../models/Hotspot'
import Validator from '../models/Validator'

interface ListParams {
  cursor?: string
  filterTypes?: Array<string>
}

type Context = Block | Account | Hotspot | Validator

export default class Transactions {
  private client!: Client

  private context?: Context

  constructor(client: Client, context?: Context) {
    this.client = client
    this.context = context
  }

  async submit(txn: string): Promise<PendingTransaction> {
    const url = '/pending_transactions'
    const { data: { data } } = await this.client.post(url, { txn })
    return new PendingTransaction(data)
  }

  async get(hash: string): Promise<AnyTransaction> {
    const url = `/transactions/${hash}`
    const { data: { data } } = await this.client.get(url)
    return Transaction.fromJsonObject(data)
  }

  async list(params: ListParams = {}): Promise<ResourceList<AnyTransaction>> {
    let url

    if (this.context instanceof Block) {
      const block = this.context as Block
      if (block.height) {
        url = `/blocks/${block.height}/transactions`
      } else if (block.hash) {
        url = `/blocks/hash/${block.hash}/transactions`
      } else {
        throw new Error('Block must have either height or hash')
      }
    } else if (this.context instanceof Account) {
      const account = this.context as Account
      url = `/accounts/${account.address}/activity`
    } else if (this.context instanceof Hotspot) {
      const hotspot = this.context as Hotspot
      url = `/hotspots/${hotspot.address}/activity`
    } else if (this.context instanceof Validator) {
      const validator = this.context as Validator
      url = `/validators/${validator.address}/activity`
    } else {
      throw new Error('Must provide a context to list transactions from')
    }
    console.log('url will be', url)

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const filter_types = params.filterTypes ? params.filterTypes.join() : undefined
    const response = await this.client.get(url, { cursor: params.cursor, filter_types })
    console.log('resposne', response)
    const { data: { data: txns, cursor } } = response
    const data = txns.map((d: TxnJsonObject) => Transaction.fromJsonObject(d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }
}
