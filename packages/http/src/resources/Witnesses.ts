import type Client from '../Client'
import ResourceList from '../ResourceList'
import Hotspot from '../models/Hotspot'
import Hotspots from './Hotspots'
import Sums, { SumsType } from './Sums'

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

  public get sum() {
    return new Sums(this.client, this.hotspot, SumsType.witnesses)
  }
}
