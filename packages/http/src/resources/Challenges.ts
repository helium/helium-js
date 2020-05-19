import type Client from '../Client'
import Challenge, { HTTPChallengeObject } from '../models/Challenge'
import ResourceList from '../ResourceList'

interface ListParams {
  cursor?: string
}

export default class Challenges {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  async list(params: ListParams = {}): Promise<ResourceList<Challenge>> {
    let url = '/challenges'
    const response = await this.client.get(url, { cursor: params.cursor })
    const { data: { data: hotspots, cursor } } = response
    const data = hotspots.map((d: HTTPChallengeObject) => new Challenge(d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  async get(hash: string): Promise<Challenge> {
    const url = `/challenges/${hash}`
    const { data: { data: hotspot } } = await this.client.get(url)
    return new Challenge(hotspot)
  }
}
