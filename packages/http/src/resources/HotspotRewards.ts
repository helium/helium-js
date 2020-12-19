import type Client from '../Client'
import HotspotReward from '../models/HotspotReward'

export default class HotspotRewards {
  private client: Client

  public address: string

  constructor(client: Client, address: string) {
    this.client = client
    this.address = address
  }

  async getSum(minTime: Date, maxTime: Date): Promise<HotspotReward> {
    const url = `/hotspots/${this.address}/rewards/sum`
    const { data: httpRewards } = await this.client.get(url, {
      min_time: minTime.toISOString(),
      max_time: maxTime.toISOString(),
    })
    return new HotspotReward(this.client, httpRewards)
  }
}
