/* eslint-disable max-classes-per-file */
import {
  Balance,
  CurrencyType,
  AnyCurrencyType,
  DataCredits,
  SecurityTokens,
  NetworkTokens,
  TestNetworkTokens,
  MobileTokens,
  IotTokens,
} from '@helium/currency'
import Address, { NetTypes } from '@helium/address'
import type Client from '../Client'
import Transactions from '../resources/Transactions'
import Roles from '../resources/Roles'
import PendingTransactions from '../resources/PendingTransactions'
import Hotspots from '../resources/Hotspots'
import Challenges from '../resources/Challenges'
import DataModel from './DataModel'
import Rewards from '../resources/Rewards'
import Validators from '../resources/Validators'

type NetType = NetTypes.NetType

export interface HTTPAccountObject {
  speculative_nonce?: number
  staked_balance?: number
  sec_nonce?: number
  sec_balance?: number
  nonce?: number
  dc_nonce?: number
  dc_balance?: number
  block?: number
  balance?: number
  mobile_balance?: number
  iot_balance?: number
  address: string
  hotspot_count?: number
  validator_count?: number
}

function toBalance(
  value: number | undefined,
  type: AnyCurrencyType,
): Balance<AnyCurrencyType> | undefined {
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
  balance?: Balance<AnyCurrencyType>
}

export type AccountData = Omit<Account, 'client'>

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

export default class Account extends DataModel {
  private client: Client

  public speculativeNonce?: number

  public stakedBalance?: Balance<NetworkTokens | TestNetworkTokens>

  public secNonce?: number

  public secBalance?: Balance<SecurityTokens>

  public nonce?: number

  public dcNonce?: number

  public dcBalance?: Balance<DataCredits>

  public block?: number

  public balance?: Balance<NetworkTokens | TestNetworkTokens>

  public mobileBalance?: Balance<MobileTokens>

  public iotBalance?: Balance<IotTokens>

  public address: string

  public netType: NetType

  public hotspotCount?: number

  public validatorCount?: number

  constructor(client: Client, account: HTTPAccountObject) {
    super()
    this.client = client
    this.netType = Address.fromB58(account.address).netType
    const currencyType = this.netType === NetTypes.TESTNET
      ? CurrencyType.testNetworkToken
      : CurrencyType.default
    this.speculativeNonce = account.speculative_nonce
    this.stakedBalance = toBalance(account.staked_balance, currencyType)
    this.secNonce = account.sec_nonce
    this.secBalance = toBalance(account.sec_balance, CurrencyType.security)
    this.nonce = account.nonce
    this.dcNonce = account.dc_nonce
    this.dcBalance = toBalance(account.dc_balance, CurrencyType.dataCredit)
    this.block = account.block
    this.balance = toBalance(account.balance, currencyType)
    this.mobileBalance = toBalance(account.mobile_balance, CurrencyType.mobile)
    this.iotBalance = toBalance(account.iot_balance, CurrencyType.iot)
    this.address = account.address
    this.hotspotCount = account.hotspot_count
    this.validatorCount = account.validator_count
  }

  public get activity(): Transactions {
    return new Transactions(this.client, this)
  }

  public get roles(): Roles {
    return new Roles(this.client, this)
  }

  public get hotspots(): Hotspots {
    return new Hotspots(this.client, this)
  }

  public get validators(): Validators {
    return new Validators(this.client, this)
  }

  public get challenges(): Challenges {
    return new Challenges(this.client, this)
  }

  public get pendingTransactions(): PendingTransactions {
    return new PendingTransactions(this.client, this)
  }

  public get rewards(): Rewards {
    return new Rewards(this.client, this)
  }

  get data(): AccountData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}
