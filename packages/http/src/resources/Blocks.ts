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

  fromHeightOrHash(heightOrHash: number | string): Block {
    if (typeof heightOrHash === 'number') {
      return new Block(this.client, { height: heightOrHash })
    }
    if (typeof heightOrHash === 'string') {
      return new Block(this.client, { hash: heightOrHash })
    }
    throw new Error('heightOrHash must be a number or string')
  }

  // TODO handle errors
  // TODO handle retry logic
  async list(params: ListParams = {}): Promise<ResourceList<Block>> {
    const {
      data: { data: blocks, cursor },
    } = await this.client.get('/blocks', { cursor: params.cursor })
    const data = blocks.map(
      (d: HTTPBlockObject) => new Block(this.client, d)
    )
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  async get(heightOrHash: number | string): Promise<Block> {
    let url
    if (typeof heightOrHash === 'number') {
      url = `/blocks/${heightOrHash}`
    }
    if (typeof heightOrHash === 'string') {
      url = `/blocks/hash/${heightOrHash}`
    }
    if (!url) throw new Error('heightOrHash must be a number or string')
    const { data: { data: block } } = await this.client.get(url)
    return new Block(this.client, block)
  }
}
