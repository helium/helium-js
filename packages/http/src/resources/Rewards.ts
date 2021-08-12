import type Client from '../Client'
import ResourceList from '../ResourceList'
import Hotspot, { Bucket, NaturalDate } from '../models/Hotspot'
import Account from '../models/Account'
import Reward, { HTTPReward } from '../models/Reward'
import Sums, { SumsType } from './Sums'
import Validator from '../models/Validator'

interface ListRewardsParams {
  minTime?: Date | NaturalDate
  maxTime?: Date
  bucket?: Bucket
  cursor?: string
}

type Context = Account | Hotspot | Validator

export default class Rewards {
  private client: Client

  private context?: Context

  constructor(client: Client, context?: Context) {
    this.client = client
    this.context = context
  }

  async list(params: ListRewardsParams): Promise<ResourceList<Reward>> {
    const {
      data: { data: rewards, cursor },
    } = await this.client.get(this.baseUrl, {
      cursor: params.cursor,
      min_time: params.minTime instanceof Date ? params.minTime?.toISOString() : params.minTime,
      max_time: params.maxTime instanceof Date ? params.maxTime?.toISOString() : params.maxTime,
      bucket: params.bucket,
    })
    const data = rewards.map((d: HTTPReward) => new Reward(this.client, d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  public get sum() {
    return new Sums(this.client, SumsType.rewards, this.context)
  }

  get baseUrl() {
    let url = ''
    if (this.context instanceof Hotspot) {
      url = `/hotspots/${this.context.address}/rewards`
    } else if (this.context instanceof Account) {
      url = `/accounts/${this.context.address}/rewards`
    } else if (this.context instanceof Validator) {
      url = `/validators/${this.context.address}/rewards`
    } else {
      throw new Error('invalid context')
    }
    return url
  }
}
