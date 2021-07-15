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

function transactionsUrlFromBlock(block: Block): string {
  if (block.height) {
    return `/blocks/${block.height}/transactions`
  }
  if (block.hash) {
    return `/blocks/hash/${block.hash}/transactions`
  }
  throw new Error('Block must have either height or hash')
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
    if (this.context instanceof Block) {
      return this.listFromBlock(params)
    }
    if (this.context instanceof Account) {
      return this.listFromAccount(params)
    }
    if (this.context instanceof Hotspot) {
      return this.listFromHotspot(params)
    }
    if (this.context instanceof Validator) {
      return this.listFromValidator(params)
    }
    throw new Error('Must provide a block, account or hotspot to list transactions from')
  }

  private async listFromBlock(params: ListParams): Promise<ResourceList<AnyTransaction>> {
    const block = this.context as Block
    const url = transactionsUrlFromBlock(block)
    const response = await this.client.get(url, { cursor: params.cursor })
    const { data: { data: txns, cursor } } = response
    const data = txns.map((d: TxnJsonObject) => Transaction.fromJsonObject(d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  private async listFromAccount(params: ListParams): Promise<ResourceList<AnyTransaction>> {
    const account = this.context as Account
    const url = `/accounts/${account.address}/activity`
    const filter_types = params.filterTypes ? params.filterTypes.join() : undefined
    const response = await this.client.get(url, { cursor: params.cursor, filter_types })
    const { data: { data: txns, cursor } } = response
    const data = txns.map((d: TxnJsonObject) => Transaction.fromJsonObject(d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  private async listFromHotspot(params: ListParams): Promise<ResourceList<AnyTransaction>> {
    const hotspot = this.context as Hotspot
    const url = `/hotspots/${hotspot.address}/activity`
    const filter_types = params.filterTypes ? params.filterTypes.join() : undefined
    const response = await this.client.get(url, { cursor: params.cursor, filter_types })
    const { data: { data: txns, cursor } } = response
    const data = txns.map((d: TxnJsonObject) => Transaction.fromJsonObject(d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  private async listFromValidator(params: ListParams): Promise<ResourceList<AnyTransaction>> {
    const validator = this.context as Validator
    const url = `/validators/${validator.address}/activity`
    const filter_types = params.filterTypes ? params.filterTypes.join() : undefined
    const response = await this.client.get(url, { cursor: params.cursor, filter_types })
    const { data: { data: txns, cursor } } = response
    const data = txns.map((d: TxnJsonObject) => Transaction.fromJsonObject(d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }
}
