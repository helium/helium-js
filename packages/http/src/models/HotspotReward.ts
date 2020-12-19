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

export default class HotspotReward extends DataModel {
  private client: Client

  public minTime: string

  public maxTime: string

  public total: number

  public sum: number

  public stddev: number

  public min: number

  public median: number

  public max: number

  public avg: number

  constructor(client: Client, rewards: HTTPHotspotRewardsSum) {
    super()
    this.client = client
    this.minTime = rewards.meta.min_time
    this.maxTime = rewards.meta.max_time
    this.total = rewards.data.total
    this.sum = rewards.data.sum
    this.stddev = rewards.data.stddev
    this.min = rewards.data.min
    this.median = rewards.data.median
    this.max = rewards.data.max
    this.avg = rewards.data.avg
  }

  get data(): HotspotRewardsData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}
