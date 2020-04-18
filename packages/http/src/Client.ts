import axios, { AxiosInstance } from 'axios'
import qs from 'qs'
import Network from './Network'
import Transactions from './resources/Transactions'
import Blocks from './resources/Blocks'
import Accounts from './resources/Accounts'
import type Account from './models/Account'
import type Block from './models/Block'

interface AccountFromAddressFn {
  (address: string): Account
}

interface BlockFromHeightOrHashFn {
  (heightOrHash: number | string): Block
}

export default class Client {
  public network!: Network
  private axios!: AxiosInstance

  constructor(network: Network = Network.production) {
    this.network = network
    this.axios = axios.create({	
      baseURL: this.network.endpoint,	
    })
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

  public get block(): BlockFromHeightOrHashFn {
    return this.blocks.fromHeightOrHash.bind(this.blocks)
  }

  public get transactions(): Transactions {
    return new Transactions(this)
  }

  async get(path: string, params: Object = {}) {
    const query = qs.stringify(params)
    const url = query.length > 0 ? [path, query].join('?') : path
    return this.axios.get(url)
  }

  async post(path: string, params: Object = {}) {
    return this.axios.post(path, params)
  }
}
