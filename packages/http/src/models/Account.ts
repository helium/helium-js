import type Client from '../Client'
import Transactions from '../resources/Transactions'
import Hotspots from '../resources/Hotspots'
import CurrencyType from './CurrencyType'
import Balance from './Balance'

export interface HTTPAccountObject {
  speculative_nonce?: number
  sec_nonce?: number
  sec_balance?: number
  nonce?: number
  dc_nonce?: number
  dc_balance?: number
  block?: number
  balance?: number
  address: string
}

function toBalance(value: number | undefined, type: CurrencyType): Balance | undefined {
  if (value === undefined) return undefined
  return new Balance(value, type)
}

export default class Account {
  private client: Client
  public speculativeNonce?: number
  public secNonce?: number
  public secBalance?: Balance
  public nonce?: number
  public dcNonce?: number
  public dcBalance?: Balance
  public block?: number
  public balance?: Balance
  public address: string

  constructor(client: Client, account: HTTPAccountObject) {
    this.client = client
    this.speculativeNonce = account.speculative_nonce
    this.secNonce = account.sec_nonce
    this.secBalance = toBalance(account.sec_balance, CurrencyType.security)
    this.nonce = account.nonce
    this.dcNonce = account.dc_nonce
    this.dcBalance = toBalance(account.dc_balance, CurrencyType.data_credit)
    this.block = account.block
    this.balance = toBalance(account.balance, CurrencyType.default)
    this.address = account.address
  }

  public get activity(): Transactions {
    return new Transactions(this.client, this)
  }

  public get hotspots(): Hotspots {
    return new Hotspots(this.client, this)
  }
}
