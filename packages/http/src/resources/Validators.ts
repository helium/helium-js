import type Client from '../Client'
import Validator, { HTTPValidatorObject } from '../models/Validator'
import ResourceList from '../ResourceList'
import Account from '../models/Account'
import Stats from './Stats'

interface ListParams {
  cursor?: string
}

type Context = Account

export default class Validators {
  private client!: Client

  private context?: Context

  constructor(client: Client, context?: Context) {
    this.client = client
    this.context = context
  }

  fromAddress(address: string): Validator {
    return new Validator(this.client, { address })
  }

  async search(term: string): Promise<ResourceList<Validator>> {
    const url = 'validators/name'
    const response = await this.client.get(url, { search: term })
    const {
      data: { data: validators },
    } = response
    const data = validators.map((d: HTTPValidatorObject) => new Validator(this.client, d))
    return new ResourceList(data, this.list.bind(this))
  }

  async list(params: ListParams = {}): Promise<ResourceList<Validator>> {
    const { validators, cursor } = await this.fetchList(params)
    const data = validators.map((d: HTTPValidatorObject) => new Validator(this.client, d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  private async fetchList(
    params: ListParams = {},
  ): Promise<{ validators: HTTPValidatorObject[]; cursor?: string }> {
    let url = '/validators'
    if (this.context instanceof Account) {
      const account = this.context as Account
      url = `/accounts/${account.address}/validators`
    }
    const response = await this.client.get(url, { cursor: params.cursor })
    const {
      data: { data: validators, cursor },
    } = response
    return { validators, cursor }
  }

  async get(address: string): Promise<Validator> {
    const url = `/validators/${address}`
    const {
      data: { data: validator },
    } = await this.client.get(url)
    return new Validator(this.client, validator)
  }

  async elected(block?: number): Promise<ResourceList<Validator>> {
    const url = block === undefined ? '/validators/elected' : `/validators/elected/${block}`
    const response = await this.client.get(url)
    const {
      data: { data: validators },
    } = response
    const data = validators.map((h: HTTPValidatorObject) => new Validator(this.client, h))
    return new ResourceList(data, this.list.bind(this))
  }

  public get stats(): Stats {
    return new Stats(this.client, 'validators')
  }
}
