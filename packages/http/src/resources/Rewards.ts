import type Client from '../Client'
import RewardSum, { HTTPRewardSum } from '../models/RewardSum'
import ResourceList from '../ResourceList'
import Hotspot, { Bucket, NaturalDate } from '../models/Hotspot'
import Account from '../models/Account'
import Reward, { HTTPReward } from '../models/Reward'

interface ListRewardsParams {
  minTime?: Date | NaturalDate
  maxTime?: Date
  bucket?: Bucket
  cursor?: string
}

type Context = Account | Hotspot

export default class Rewards {
  private client: Client

  private context: Context

  constructor(client: Client, context: Context) {
    this.client = client
    this.context = context
  }

  async list(params: ListRewardsParams): Promise<ResourceList<Reward>> {
    const {
      data: { data: rewards, cursor },
    } = await this.client.get(this.baseUrl(), {
      cursor: params.cursor,
      min_time: params.minTime instanceof Date ? params.minTime?.toISOString() : params.minTime,
      max_time: params.maxTime instanceof Date ? params.maxTime?.toISOString() : params.maxTime,
      bucket: params.bucket,
    })
    const data = rewards.map((d: HTTPReward) => new Reward(this.client, d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  async listSums(params: ListRewardsParams): Promise<ResourceList<RewardSum>> {
    if (!params.bucket) {
      throw new Error('missing bucket param')
    }
    const url = `${this.baseUrl()}/sum`
    const {
      data: { data: rewards, cursor },
    } = await this.client.get(url, {
      cursor: params.cursor,
      min_time: params.minTime instanceof Date ? params.minTime?.toISOString() : params.minTime,
      max_time: params.maxTime instanceof Date ? params.maxTime?.toISOString() : params.maxTime,
      bucket: params.bucket,
    })
    const data = rewards.map((d: HTTPRewardSum) => new RewardSum(this.client, d))
    return new ResourceList(data, this.listSums.bind(this), cursor)
  }

  async getSum(minTime: Date, maxTime: Date): Promise<RewardSum> {
    const url = `${this.baseUrl()}/sum`
    const {
      data: { data: rewards },
    } = await this.client.get(url, {
      min_time: minTime.toISOString(),
      max_time: maxTime.toISOString(),
    })
    return new RewardSum(this.client, rewards)
  }

  baseUrl() {
    let url = ''
    if (this.context instanceof Hotspot) {
      url = `/hotspots/${this.context.address}/rewards`
    } else if (this.context instanceof Account) {
      url = `/accounts/${this.context.address}/rewards`
    } else {
      throw new Error('invalid context')
    }
    return url
  }
}
