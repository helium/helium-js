import type Client from '../Client'
import ResourceList from '../ResourceList'
import { HTTPWitnessSum, WitnessSum } from '../models/WitnessSum'
import Hotspot, { Bucket, NaturalDate } from '../models/Hotspot'
import Hotspots from './Hotspots'

interface ListSumsParams {
  minTime?: Date | NaturalDate
  maxTime?: Date
  bucket?: Bucket
  cursor?: string
}

interface ListParams {
  cursor?: string
}

export default class Witnesses {
  private client!: Client

  private hotspot: Hotspot

  constructor(client: Client, hotspot: Hotspot) {
    this.client = client
    this.hotspot = hotspot
  }

  async list(params: ListParams = {}): Promise<ResourceList<Hotspot>> {
    const hotspots = new Hotspots(this.client, this.hotspot)
    return hotspots.list(params)
  }

  async listSums(params: ListSumsParams): Promise<ResourceList<WitnessSum>> {
    const url = `/hotspots/${this.hotspot.address}/witnesses/sum`
    const { data: { data: witnessSums, cursor } } = await this.client.get(url, {
      cursor: params.cursor,
      min_time: params.minTime instanceof Date ? params.minTime?.toISOString() : params.minTime,
      max_time: params.maxTime instanceof Date ? params.maxTime?.toISOString() : params.maxTime,
      bucket: params.bucket,
    })
    const data = witnessSums.map((d: HTTPWitnessSum) => new WitnessSum(this.client, d))
    return new ResourceList(data, this.listSums.bind(this), cursor)
  }
}
