import type Client from '../Client'
import ResourceList from '../ResourceList'
import City, { HTTPCityObject } from '../models/City'

interface ListParams {
  cursor?: string
}

interface SearchParams {
  cursor?: string
  query?: string
}

export default class Cities {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  async list(params: ListParams = {}): Promise<ResourceList<City>> {
    const url = '/hotspots/cities'
    const response = await this.client.get(url, { cursor: params.cursor })
    const { data: { data: cities, cursor } } = response
    const data = cities.map((d: HTTPCityObject) => new City(d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  async search(params: SearchParams = {}): Promise<ResourceList<City>> {
    const url = encodeURI(`/hotspots/cities?search=${params.query}`)
    const { data: { data: cities, cursor } } = await this.client.get(url)
    const data = cities.map((d: HTTPCityObject) => new City(d))
    return new ResourceList(data, this.search.bind(this), cursor, { query: params.query })
  }
}
