import type Client from '../Client'
import Challenge, { HTTPChallengeObject } from '../models/Challenge'
import ResourceList from '../ResourceList'
import Account from '../models/Account'

interface ListParams {
  cursor?: string
}

type Context = Account

export default class Challenges {
  private client!: Client
  private context?: Context

  constructor(client: Client, context?: Context) {
    this.client = client
    this.context = context
  }

  async list(params: ListParams = {}): Promise<ResourceList<Challenge>> {
    let url = '/challenges'
    if (this.context instanceof Account) {
      const account = this.context as Account
      url = `/accounts/${account.address}/challenges`
    }
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
