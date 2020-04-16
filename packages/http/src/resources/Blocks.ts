import type Client from '../Client'
import Block from '../models/Block'
import type { HTTPBlockObject } from '../models/Block'
import ResourceList from '../ResourceList'

interface ListParams {
  cursor?: string
}

export default class Blocks {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  // TODO handle errors
  // TODO handle retry logic
  async list(params: ListParams = {}): Promise<ResourceList> {
    const {
      data: { data: blocks, cursor },
    } = await this.client.get('/blocks', { cursor: params.cursor })
    const data = blocks.map(
      (d: HTTPBlockObject) => new Block(this.client, d)
    )
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  async get(height: number): Promise<Block> {
    const { data: { data: block } } = await this.client.get(`/blocks/${height}`)
    return new Block(this.client, block)
  }

  async getHash(hash: string): Promise<Block> {
    const { data: { data: block } } = await this.client.get(`/blocks/hash/${hash}`)
    return new Block(this.client, block)
  }
}
