import type Client from '../Client'
import Location from '../models/Location'

export default class Locations {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  async get(h3Index: string): Promise<Location> {
    const url = `/locations/${h3Index}`
    const { data: { data: location } } = await this.client.get(url)
    return new Location(this.client, location)
  }
}
