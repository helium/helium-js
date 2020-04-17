import qs from 'qs'
import fetch from 'isomorphic-unfetch'
import Network from './Network'
import Transactions from './resources/Transactions'
import Blocks from './resources/Blocks'
import Accounts from './resources/Accounts'
import type Account from './models/Account'
import type Block from './models/Block'

interface AccountFromAddressFn {
  (address: string): Account
}

interface BlockFromHeightFn {
  (height: number): Block
}

export default class Client {
  public network!: Network

  constructor(network: Network = Network.production) {
    this.network = network
  }

  public get accounts(): Accounts {
    return new Accounts(this)
  }

  public get account(): AccountFromAddressFn {
    return this.accounts.fromAddress.bind(this.accounts)
  }

  public get blocks(): Blocks {
    return new Blocks(this)
  }

  public get block(): BlockFromHeightFn {
    return this.blocks.fromHeight.bind(this.blocks)
  }

  public get transactions(): Transactions {
    return new Transactions(this)
  }

  async get(path: string, params: Object = {}) {
    const query = qs.stringify(params)
    const url = this.toURL(query.length > 0 ? [path, query].join('?') : path)
    const response = await fetch(url)
    const data = await response.json()
    return { data }
  }

  async post(path: string, params: Object = {}) {
    const url = this.toURL(path)
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(params),
    })
    const data = await response.json()
    return { data }
  }

  private toURL(path: string):string {
    return [this.network.endpoint, path].join('')
  }
}
