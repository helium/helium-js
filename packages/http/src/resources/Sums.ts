import type Client from '../Client'
import Sum, { HTTPSum } from '../models/Sum'
import ResourceList from '../ResourceList'
import Hotspot, { Bucket, NaturalDate } from '../models/Hotspot'
import Account from '../models/Account'

interface ListRewardsParams {
  minTime?: Date | NaturalDate
  maxTime?: Date
  bucket?: Bucket
  cursor?: string
}

type Context = Account | Hotspot

export default class Sums {
  private client: Client

  private context: Context

  constructor(client: Client, context: Context) {
    this.client = client
    this.context = context
  }

  async list(params: ListRewardsParams): Promise<ResourceList<Sum>> {
    if (!params.bucket) {
      throw new Error('missing bucket param')
    }
    const {
      data: { data: rewards, cursor },
    } = await this.client.get(this.baseUrl, {
      cursor: params.cursor,
      min_time: params.minTime instanceof Date ? params.minTime?.toISOString() : params.minTime,
      max_time: params.maxTime instanceof Date ? params.maxTime?.toISOString() : params.maxTime,
      bucket: params.bucket,
    })
    const data = rewards.map((d: HTTPSum) => new Sum(this.client, d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  async get(minTime: Date, maxTime: Date): Promise<Sum> {
    const {
      data: { data: rewards },
    } = await this.client.get(this.baseUrl, {
      min_time: minTime.toISOString(),
      max_time: maxTime.toISOString(),
    })
    return new Sum(this.client, rewards)
  }

  get baseUrl() {
    let url = ''
    if (this.context instanceof Hotspot) {
      url = `/hotspots/${this.context.address}/rewards/sum`
    } else if (this.context instanceof Account) {
      url = `/accounts/${this.context.address}/rewards/sum`
    } else {
      throw new Error('invalid context')
    }
    return url
  }
}
