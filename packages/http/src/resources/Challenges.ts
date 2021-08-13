import type Client from '../Client'
import Challenge, { HTTPChallengeObject } from '../models/Challenge'
import ResourceList from '../ResourceList'
import Account from '../models/Account'
import Hotspot from '../models/Hotspot'
import Sums, { SumsType } from './Sums'

interface ListParams {
  cursor?: string
}

type Context = Account | Hotspot

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
    } else if (this.context instanceof Hotspot) {
      const hotspot = this.context as Hotspot
      url = `/hotspots/${hotspot.address}/challenges`
    }
    const response = await this.client.get(url, { cursor: params.cursor })
    const { data: { data: challenges, cursor } } = response
    const data = challenges.map((d: HTTPChallengeObject) => new Challenge(d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  async get(hash: string): Promise<Challenge> {
    const url = `/challenges/${hash}`
    const { data: { data: challenge } } = await this.client.get(url)
    return new Challenge(challenge)
  }

  public get sum() {
    if (this.context instanceof Hotspot) {
      return new Sums(this.client, SumsType.challenges, this.context)
    }
    throw new Error('invalid context')
  }
}
