import type Client from '../Client'
import ResourceList from '../ResourceList'
import Election from '../models/Election'

interface ListParams {
  cursor?: string
}

export default class Elections {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  async list(params: ListParams = {}): Promise<ResourceList<Election>> {
    const url = '/elections'
    const response = await this.client.get(url, { cursor: params.cursor })
    const { data: { data: elections, cursor } } = response
    return new ResourceList(elections, this.list.bind(this), cursor)
  }

  async get(hash: string): Promise<Election> {
    const url = `/transactions/${hash}`
    const { data: { data: election } } = await this.client.get(url)
    return election
  }
}
