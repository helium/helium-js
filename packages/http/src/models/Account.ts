import { Balance, CurrencyType } from '@helium/currency'
import type Client from '../Client'
import Transactions from '../resources/Transactions'
import PendingTransactions from '../resources/PendingTransactions'
import Hotspots from '../resources/Hotspots'
import Challenges from '../resources/Challenges'

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

export interface HTTPStatsObject {
  last_week: Array<HTTPTimelineStats>
  last_month: Array<HTTPTimelineStats>
  last_day: Array<HTTPTimelineStats>
}

export interface HTTPTimelineStats {
  timestamp: string
  balance: number
}

export interface TimelineStats {
  timestamp: string
  balance?: Balance
}

export class AccountStats {
  constructor(data: HTTPStatsObject) {
    this.lastWeek = data.last_week.map((s) => ({
      timestamp: s.timestamp,
      balance: toBalance(s.balance, CurrencyType.default),
    }))
    this.lastMonth = data.last_month.map((s) => ({
      timestamp: s.timestamp,
      balance: toBalance(s.balance, CurrencyType.default),
    }))
    this.lastDay = data.last_day.map((s) => ({
      timestamp: s.timestamp,
      balance: toBalance(s.balance, CurrencyType.default),
    }))
  }

  public lastWeek: Array<TimelineStats>
  public lastMonth: Array<TimelineStats>
  public lastDay: Array<TimelineStats>
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
    this.dcBalance = toBalance(account.dc_balance, CurrencyType.dataCredit)
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

  public get challenges(): Challenges {
    return new Challenges(this.client, this)
  }

  public get pendingTransactions(): PendingTransactions {
    return new PendingTransactions(this.client, this)
  }
}
