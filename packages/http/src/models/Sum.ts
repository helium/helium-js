import Balance, { CurrencyType, NetworkTokens } from '@helium/currency'
import DataModel from './DataModel'
import Client from '../Client'

export type RewardSumData = Omit<Sum, 'client'>

export interface HTTPSum {
  total: number
  sum: number
  stddev: number
  min: number
  median: number
  max: number
  avg: number
}

function floatToBalance(floatValue: number): Balance<NetworkTokens> {
  return Balance.fromFloat(floatValue, CurrencyType.networkToken)
}

export default class Sum extends DataModel {
  private client: Client

  public total: Balance<NetworkTokens>

  public stddev: Balance<NetworkTokens>

  public min: Balance<NetworkTokens>

  public median: Balance<NetworkTokens>

  public max: Balance<NetworkTokens>

  public avg: Balance<NetworkTokens>

  constructor(client: Client, rewards: HTTPSum) {
    super()
    this.client = client
    this.total = floatToBalance(rewards.total)
    this.stddev = floatToBalance(rewards.stddev)
    this.min = floatToBalance(rewards.min)
    this.median = floatToBalance(rewards.median)
    this.max = floatToBalance(rewards.max)
    this.avg = floatToBalance(rewards.avg)
  }

  get data(): RewardSumData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}
