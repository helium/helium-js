import type Client from '../Client'
import Hotspot, { HTTPHotspotObject } from '../models/Hotspot'
import ResourceList from '../ResourceList'
import Account from '../models/Account'
import City from '../models/City'

interface ListParams {
  cursor?: string
}

type Context = Account | City

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

  async search(term: string): Promise<ResourceList<Hotspot>> {
    const url = 'hotspots/name'
    const response = await this.client.get(url, { search: term })
    const {
      data: { data: hotspots },
    } = response
    const data = hotspots.map((d: HTTPHotspotObject) => new Hotspot(this.client, d))
    return new ResourceList(data, this.list.bind(this))
  }

  async list(params: ListParams = {}): Promise<ResourceList<Hotspot>> {
    const { hotspots, cursor } = await this.fetchList(params)
    const data = hotspots.map((d: HTTPHotspotObject) => new Hotspot(this.client, d))
    return new ResourceList(data, this.list.bind(this), cursor)
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

  async elected(block?: number): Promise<ResourceList<Hotspot>> {
    const url = block === undefined ? '/hotspots/elected' : `/hotspots/elected/${block}`
    const response = await this.client.get(url)
    const {
      data: { data: hotspots },
    } = response
    const data = hotspots.map((h: HTTPHotspotObject) => new Hotspot(this.client, h))
    return new ResourceList(data, this.list.bind(this))
  }

  async hex(index: string, params?: ListParams): Promise<ResourceList<Hotspot>> {
    const response = await this.client.get(`/hotspots/hex/${index}`, { cursor: params?.cursor })
    const {
      data: { data: hotspots, cursor },
    } = response
    const data = hotspots.map((h: HTTPHotspotObject) => new Hotspot(this.client, h))
    const fetchMore = (nextParams: ListParams) => this.hex(index, nextParams)
    return new ResourceList(data, fetchMore, cursor)
  }

  async locationDistance(params: {
    lat?: number
    lon?: number
    distance?: number
    cursor?: string
  }): Promise<ResourceList<Hotspot>> {
    const response = await this.client.get('/hotspots/location/distance', params)
    const {
      data: { data: hotspots, cursor },
    } = response
    const data = hotspots.map((h: HTTPHotspotObject) => new Hotspot(this.client, h))
    return new ResourceList(data, this.locationDistance.bind(this), cursor)
  }
}
