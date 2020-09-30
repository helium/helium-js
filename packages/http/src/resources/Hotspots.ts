import type Client from '../Client'
import Hotspot, { HTTPHotspotObject } from '../models/Hotspot'
import ResourceList from '../ResourceList'
import Account from '../models/Account'
import City from '../models/City'

interface ListParams {
  cursor?: string
}

interface WitnessParams {
  address?: string
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

  async listWitnesses(params: WitnessParams = {}): Promise<ResourceList<Hotspot>> {
    const url = `/hotspots/${params.address}/witnesses`
    const response = await this.client.get(url)
    const { data: { data: hotspots } } = response
    const data = hotspots.map((d: HTTPHotspotObject) => new Hotspot(this.client, d))
    return new ResourceList(data, this.listWitnesses.bind(this))
  }

  async list(params: ListParams = {}): Promise<ResourceList<Hotspot>> {
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
    const { data: { data: hotspots, cursor } } = response
    const data = hotspots.map((d: HTTPHotspotObject) => new Hotspot(this.client, d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  async get(address: string): Promise<Hotspot> {
    const url = `/hotspots/${address}`
    const { data: { data: hotspot } } = await this.client.get(url)
    return new Hotspot(this.client, hotspot)
  }
}
