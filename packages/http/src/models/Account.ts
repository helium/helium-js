import type Client from '../Client'
import Transactions from '../resources/Transactions'
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
    this.secBalance = account.sec_balance ? new Balance(account.sec_balance, CurrencyType.security) : undefined
    this.nonce = account.nonce
    this.dcNonce = account.dc_nonce
    this.dcBalance = account.dc_balance ? new Balance(account.dc_balance, CurrencyType.data_credit) : undefined
    this.block = account.block
    this.balance = account.balance ? new Balance(account.balance, CurrencyType.default) : undefined
    this.address = account.address
  }

  public get activity(): Transactions {
    return new Transactions(this.client, this)
  }
}
