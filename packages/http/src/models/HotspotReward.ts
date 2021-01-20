import Balance, { CurrencyType, NetworkTokens } from '@helium/currency'
import DataModel from './DataModel'
import Client from '../Client'

export type HotspotRewardsData = Omit<HotspotReward, 'client'>

interface HTTPHotspotRewardsTimes {
  min_time: string
  max_time: string
}

interface HTTPHotspotRewards {
  total: number
  sum: number
  stddev: number
  min: number
  median: number
  max: number
  avg: number
}

interface HTTPHotspotRewardsSum {
  meta: HTTPHotspotRewardsTimes
  data: HTTPHotspotRewards
}

export type HotspotRewardData = HotspotReward

function toBalance(floatValue: number): Balance<NetworkTokens> {
  return Balance.fromFloat(floatValue, CurrencyType.networkToken)
}

export default class HotspotReward extends DataModel {
  private client: Client

  public minTime: string

  public maxTime: string

  public total: Balance<NetworkTokens>

  public stddev: Balance<NetworkTokens>

  public min: Balance<NetworkTokens>

  public median: Balance<NetworkTokens>

  public max: Balance<NetworkTokens>

  public avg: Balance<NetworkTokens>

  constructor(client: Client, rewards: HTTPHotspotRewardsSum) {
    super()
    this.client = client
    this.minTime = rewards.meta.min_time
    this.maxTime = rewards.meta.max_time
    this.total = toBalance(rewards.data.total)
    this.stddev = toBalance(rewards.data.stddev)
    this.min = toBalance(rewards.data.min)
    this.median = toBalance(rewards.data.median)
    this.max = toBalance(rewards.data.max)
    this.avg = toBalance(rewards.data.avg)
  }

  get data(): HotspotRewardsData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}
