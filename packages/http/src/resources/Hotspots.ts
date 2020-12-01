import type Client from '../Client'
import Hotspot, { HTTPHotspotObject } from '../models/Hotspot'
import ResourceList from '../ResourceList'
import Account from '../models/Account'
import City from '../models/City'

interface ListParams {
  cursor?: string
}

type Context = Account | City | Hotspot

export default class Hotspots {
  private client!: Client

  private context?: Context

  constructor(client: Client, context?: Context) {
    this.client = client
    this.context = context
  }

  fromAddress(address: string): Hotspot {
    return new Hotspot(this.client, { address })
  }

  async list(params: ListParams = {}): Promise<ResourceList<Hotspot>> {
    const { hotspots, cursor } = await this.fetchList(params)
    const data = hotspots.map(
      (d: HTTPHotspotObject) => new Hotspot(this.client, d),
    )
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  async listJson(
    params: ListParams = {},
  ): Promise<ResourceList<HTTPHotspotObject>> {
    const { hotspots, cursor } = await this.fetchList(params)
    return new ResourceList(hotspots, this.list.bind(this), cursor)
  }

  private async fetchList(
    params: ListParams = {},
  ): Promise<{ hotspots: HTTPHotspotObject[]; cursor?: string }> {
    let url = '/hotspots'
    if (this.context instanceof Account) {
      const account = this.context as Account
      url = `/accounts/${account.address}/hotspots`
    }
    if (this.context instanceof City) {
      const city = this.context as City
      url = `/cities/${city.cityId}/hotspots`
    }
    if (this.context instanceof Hotspot) {
      const hotspot = this.context as Hotspot
      url = `/hotspots/${hotspot.address}/witnesses`
    }
    const response = await this.client.get(url, { cursor: params.cursor })
    const {
      data: { data: hotspots, cursor },
    } = response
    return { hotspots, cursor }
  }

  async get(address: string): Promise<Hotspot> {
    const url = `/hotspots/${address}`
    const {
      data: { data: hotspot },
    } = await this.client.get(url)
    return new Hotspot(this.client, hotspot)
  }
}
