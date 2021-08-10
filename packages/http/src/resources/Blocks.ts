import camelcaseKeys from 'camelcase-keys'
import BlockStats from '../models/BlockStats'
import type Client from '../Client'
import Block from '../models/Block'
import type { HTTPBlockObject } from '../models/Block'
import ResourceList from '../ResourceList'

interface ListParams {
  cursor?: string
}

function stringIsInt(str: string): boolean {
  return !!str.match(/^\d+$/)
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
      if (stringIsInt(heightOrHash)) {
        return new Block(this.client, { height: parseInt(heightOrHash) })
      }
      return new Block(this.client, { hash: heightOrHash })
    }
    throw new Error('heightOrHash must be a number or string')
  }

  async list(params: ListParams = {}): Promise<ResourceList<Block>> {
    const {
      data: { data: blocks, cursor },
    } = await this.client.get('/blocks', { cursor: params.cursor })
    const data = blocks.map((d: HTTPBlockObject) => new Block(this.client, d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  async get(heightOrHash: number | string): Promise<Block> {
    let url
    if (typeof heightOrHash === 'number') {
      url = `/blocks/${heightOrHash}`
    } else if (typeof heightOrHash === 'string') {
      if (stringIsInt(heightOrHash)) {
        url = `/blocks/${parseInt(heightOrHash)}`
      } else {
        url = `/blocks/hash/${heightOrHash}`
      }
    }
    if (!url) throw new Error('heightOrHash must be a number or string')
    const {
      data: { data: block },
    } = await this.client.get(url)
    return new Block(this.client, block)
  }

  async getHeight(params?: {maxTime?: string}): Promise<number> {
    let path = '/blocks/height'
    if (params?.maxTime) {
      path += `?max_time=${params?.maxTime}`
    }
    const { data: { data: { height } } } = await this.client.get(path)
    return height
  }

  async stats() {
    const { data: { data: stats } } = await this.client.get('/blocks/stats')
    return camelcaseKeys(stats) as BlockStats
  }
}
