import axios, { AxiosInstance } from 'axios'
import qs from 'qs'
import Network from './Network'
import Transactions from './resources/Transactions'
import Blocks from './resources/Blocks'
import Accounts from './resources/Accounts'
import { getUserAgent } from './util/instrument'

export default class Client {
  public network!: Network
  private axios!: AxiosInstance

  public transactions!: Transactions
  public blocks!: Blocks
  public accounts!: Accounts

  constructor(network: Network = Network.production) {
    this.network = network

    this.axios = axios.create({
      baseURL: this.network.endpoint,
      headers: {
        'User-Agent': getUserAgent(),
      },
    })

    this.transactions = new Transactions(this)
    this.blocks = new Blocks(this)
    this.accounts = new Accounts(this)
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
