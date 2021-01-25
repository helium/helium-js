import type Client from '../Client'
import { HotspotReward, HotspotRewardSum, HTTPHotspotReward } from '../models/HotspotReward'
import ResourceList from '../ResourceList'

interface ListRewardsParams {
  minTime?: Date
  maxTime?: Date
  cursor?: string
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
      min_time: params.minTime?.toISOString(),
      max_time: params.maxTime?.toISOString(),
    })
    const data = rewards.map((d: HTTPHotspotReward) => new HotspotReward(this.client, d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  async getSum(minTime: Date, maxTime: Date): Promise<HotspotRewardSum> {
    const url = `/hotspots/${this.address}/rewards/sum`
    const { data: httpRewards } = await this.client.get(url, {
      min_time: minTime.toISOString(),
      max_time: maxTime.toISOString(),
    })
    return new HotspotRewardSum(this.client, httpRewards)
  }
}
