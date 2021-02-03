import Balance, { CurrencyType, NetworkTokens } from '@helium/currency'
import DataModel from './DataModel'
import Client from '../Client'

export type HotspotRewardSumData = Omit<HotspotRewardSum, 'client'>
export type HotspotRewardData = Omit<HotspotReward, 'client'>

export interface HTTPHotspotRewardSum {
  total: number
  sum: number
  stddev: number
  min: number
  median: number
  max: number
  avg: number
}

export interface HTTPHotspotReward {
  account: string
  amount: number
  block: number
  gateway: string
  hash: string
  timestamp: string
}

function floatToBalance(floatValue: number): Balance<NetworkTokens> {
  return Balance.fromFloat(floatValue, CurrencyType.networkToken)
}

function integerToBalance(integerValue: number): Balance<NetworkTokens> {
  return new Balance(integerValue, CurrencyType.networkToken)
}

export class HotspotRewardSum extends DataModel {
  private client: Client

  public total: Balance<NetworkTokens>

  public stddev: Balance<NetworkTokens>

  public min: Balance<NetworkTokens>

  public median: Balance<NetworkTokens>

  public max: Balance<NetworkTokens>

  public avg: Balance<NetworkTokens>

  constructor(client: Client, rewards: HTTPHotspotRewardSum) {
    super()
    this.client = client
    this.total = floatToBalance(rewards.total)
    this.stddev = floatToBalance(rewards.stddev)
    this.min = floatToBalance(rewards.min)
    this.median = floatToBalance(rewards.median)
    this.max = floatToBalance(rewards.max)
    this.avg = floatToBalance(rewards.avg)
  }

  get data(): HotspotRewardSumData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}

export class HotspotReward extends DataModel {
  private client: Client

  public account: string

  public amount: Balance<NetworkTokens>

  public block: number

  public gateway: string

  public hash: string

  public timestamp: string

  constructor(client: Client, rewards: HTTPHotspotReward) {
    super()
    this.client = client
    this.account = rewards.account
    this.amount = integerToBalance(rewards.amount)
    this.block = rewards.block
    this.gateway = rewards.gateway
    this.hash = rewards.hash
    this.timestamp = rewards.timestamp
  }

  get data(): HotspotRewardData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}
