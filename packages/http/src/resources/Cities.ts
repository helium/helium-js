import type Client from '../Client'
import ResourceList from '../ResourceList'
import City, { HTTPCityObject } from '../models/City'
import Hotspot, { HTTPHotspotObject } from '../models/Hotspot'

interface ListParams {
  cursor?: string
  query?: string
}

interface HotspotParams {
  cityId?: string
  cursor?: string
}

export default class Cities {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  async list(params: ListParams = {}): Promise<ResourceList<City>> {
    const url = encodeURI('/cities')
    const result = await this.client.get(url, { search: params.query, cursor: params.cursor })
    const { data: { data: cities, cursor } } = result
    const data = cities.map((city: HTTPCityObject) => new City(city))
    return new ResourceList(data, this.list.bind(this), cursor, { query: params.query })
  }

  async getHotspots(params: HotspotParams = {}): Promise<ResourceList<Hotspot>> {
    if (!params.cityId) throw new Error('you must provide a city id')
    const url = encodeURI(`/cities/${params.cityId}/hotspots`)
    const result = await this.client.get(url, { cursor: params.cursor })
    const { data: { data: hotspots, cursor } } = result
    const data = hotspots.map((hotspot: HTTPHotspotObject) => new Hotspot(this.client, hotspot))
    return new ResourceList(data, this.getHotspots.bind(this), cursor, { cityId: params.cityId })
  }
}
