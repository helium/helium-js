import type Client from '../Client'
import Role, { RoleJsonObject } from '../models/Role'
import Block from '../models/Block'
import Account from '../models/Account'
import ResourceList from '../ResourceList'
import Hotspot from '../models/Hotspot'
import Validator from '../models/Validator'

export type NaturalDate = string // in the format "-${number} ${Bucket}" eg "-1 day"

interface ListParams {
  cursor?: string
  filterTypes?: Array<string>
  minTime?: Date | NaturalDate
  maxTime?: Date | NaturalDate
  limit?: number
}

type Context = Block | Account | Hotspot | Validator

export default class Roles {
  private client!: Client

  private context?: Context

  constructor(client: Client, context?: Context) {
    this.client = client
    this.context = context
  }

  async list(params: ListParams = {}): Promise<ResourceList<Role>> {
    const {
      data: { data: roles, cursor },
    } = await this.client.get(this.activityUrl, {
      cursor: params.cursor,
      filter_types: params.filterTypes ? params.filterTypes.join() : undefined,
      min_time: params.minTime instanceof Date ? params.minTime?.toISOString() : params.minTime,
      max_time: params.maxTime instanceof Date ? params.maxTime?.toISOString() : params.maxTime,
      limit: params.limit,
    })
    const data = roles.map((d: RoleJsonObject) => d)
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  private get activityUrl(): string {
    let url

    if (this.context instanceof Account) {
      const account = this.context as Account
      url = `/accounts/${account.address}/roles`
    } else if (this.context instanceof Hotspot) {
      const hotspot = this.context as Hotspot
      url = `/hotspots/${hotspot.address}/roles`
    } else if (this.context instanceof Validator) {
      const validator = this.context as Validator
      url = `/validators/${validator.address}/roles`
    } else {
      throw new Error('Must provide a context to list roles from')
    }

    return url
  }
}
