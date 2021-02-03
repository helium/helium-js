import type Client from '../Client'
import ResourceList from '../ResourceList'
import { HTTPWitnessSum, WitnessSum } from '../models/WitnessSum'

interface ListParams {
  minTime?: Date | string // Date or natural format eg: '-30 day' '-1 week' '-5 hour'
  maxTime?: Date | string // Date or leave out for current time
  bucket?: 'hour' | 'day' | 'week'
  cursor?: string
}

export default class WitnessSums {
  private client!: Client

  private address: string

  constructor(client: Client, address: string) {
    this.client = client
    this.address = address
  }

  async list(params: ListParams): Promise<ResourceList<WitnessSum>> {
    const url = `/hotspots/${this.address}/witnesses/sum`
    const { data: { data: witnessSums, cursor } } = await this.client.get(url, {
      cursor: params.cursor,
      min_time: params.minTime instanceof Date ? params.minTime?.toISOString() : params.minTime,
      max_time: params.maxTime instanceof Date ? params.maxTime?.toISOString() : params.maxTime,
      bucket: params.bucket,
    })
    const data = witnessSums.map((d: HTTPWitnessSum) => new WitnessSum(this.client, d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }
}
