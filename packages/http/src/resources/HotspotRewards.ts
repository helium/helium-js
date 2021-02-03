import type Client from '../Client'
import {
  HotspotReward,
  HotspotRewardSum,
  HTTPHotspotReward,
  HTTPHotspotRewardSum,
} from '../models/HotspotReward'
import ResourceList from '../ResourceList'

interface ListRewardsParams {
  minTime?: Date | string // Date or natural format eg: '-30 day' '-1 week' '-5 hour'
  maxTime?: Date | string // Date or leave out for current time
  cursor?: string
  bucket?: 'hour' | 'day' | 'week'
}

export default class HotspotRewards {
  private client: Client

  public address: string

  constructor(client: Client, address: string) {
    this.client = client
    this.address = address
  }

  async list(params: ListRewardsParams): Promise<ResourceList<HotspotReward>> {
    const url = `/hotspots/${this.address}/rewards`
    const { data: { data: rewards, cursor } } = await this.client.get(url, {
      cursor: params.cursor,
      min_time: params.minTime instanceof Date ? params.minTime?.toISOString() : params.minTime,
      max_time: params.maxTime instanceof Date ? params.maxTime?.toISOString() : params.maxTime,
      bucket: params.bucket,
    })
    const data = rewards.map((d: HTTPHotspotReward) => new HotspotReward(this.client, d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  async listSums(params: ListRewardsParams): Promise<ResourceList<HotspotRewardSum>> {
    if (!params.bucket) {
      throw new Error('missing bucket param')
    }
    const url = `/hotspots/${this.address}/rewards/sum`
    const { data: { data: rewards, cursor } } = await this.client.get(url, {
      cursor: params.cursor,
      min_time: params.minTime instanceof Date ? params.minTime?.toISOString() : params.minTime,
      max_time: params.maxTime instanceof Date ? params.maxTime?.toISOString() : params.maxTime,
      bucket: params.bucket,
    })
    const data = rewards.map((d: HTTPHotspotRewardSum) => new HotspotRewardSum(this.client, d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  async getSum(minTime: Date, maxTime: Date): Promise<HotspotRewardSum> {
    const url = `/hotspots/${this.address}/rewards/sum`
    const { data: { data: rewards } } = await this.client.get(url, {
      min_time: minTime.toISOString(),
      max_time: maxTime.toISOString(),
    })
    return new HotspotRewardSum(this.client, rewards)
  }
}
