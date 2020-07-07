import type Client from '../Client'
import ResourceList from '../ResourceList'
import City, { HTTPCityObject } from '../models/City'

interface ListParams {
  cursor?: string
  query?: string
}

export default class Cities {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  fromId(cityId: string): City {
    return new City(this.client, { city_id: cityId })
  }

  async list(params: ListParams = {}): Promise<ResourceList<City>> {
    const url = encodeURI('/cities')
    const result = await this.client.get(url, { search: params.query, cursor: params.cursor })
    const { data: { data: cities, cursor } } = result
    const data = cities.map((city: HTTPCityObject) => new City(this.client, city))
    return new ResourceList(data, this.list.bind(this), cursor)
  }
}
