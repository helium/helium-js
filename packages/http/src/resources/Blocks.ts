import type Client from '../Client'
import Block from '../models/Block'
import type { HTTPBlockObject } from '../models/Block'

export default class Blocks {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  // TODO handle errors
  // TODO handle retry logic
  // TODO cursor pagination
  async list(): Promise<Array<Block>> {
    const { data: { data: blocks } } = await this.client.get('/blocks')
    return blocks.map((d: HTTPBlockObject) => new Block(this.client, d))
  }

  async get(height: number): Promise<Block> {
    const { data: { data: block } } = await this.client.get(`/blocks/${height}`)
    return new Block(this.client, block)
  }
}
