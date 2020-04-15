import type Client from '../Client'
import Transactions from '../resources/Transactions'
import { Balance, CurrencyType } from '../util/currency'

export interface HTTPAccountObject {
  speculative_nonce?: number
  sec_nonce: number
  sec_balance: number
  nonce: number
  dc_nonce: number
  dc_balance: number
  block: number
  balance: number
  address: string
}


export default class Account {
  // private client: Client
  public speculativeNonce?: number
  public secNonce: number
  public secBalance: Balance
  public nonce: number
  public dcNonce: number
  public dcBalance: Balance
  public block: number
  public balance: Balance
  public address: string
  public activity: Transactions

  constructor(client: Client, account: HTTPAccountObject) {
    // this.client = client

    this.speculativeNonce = account.speculative_nonce
    this.secNonce = account.sec_nonce
    this.secBalance = new Balance(account.sec_balance, CurrencyType.security)
    this.nonce = account.nonce
    this.dcNonce = account.dc_nonce
    this.dcBalance = new Balance(account.dc_balance, CurrencyType.data_credit)
    this.block = account.block
    this.balance = new Balance(account.balance, CurrencyType.default)
    this.address = account.address

    this.activity = new Transactions(client, { account: this })
  }
}
