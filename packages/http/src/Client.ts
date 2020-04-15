import axios, { AxiosInstance } from 'axios'
import qs from 'qs'
import Network from './Network'
import Transactions from './resources/Transactions'
import Blocks from './resources/Blocks'
import Accounts from './resources/Accounts'
import { getUserAgent } from './util/instrument'

export default class Client {
  public network!: Network
  public transactions!: Transactions
  public blocks!: Blocks
  public accounts!: Accounts
  private axios!: AxiosInstance

  constructor(network: Network = Network.production) {
    this.network = network

    this.transactions = new Transactions(this)
    this.blocks = new Blocks(this)
    this.accounts = new Accounts(this)

    this.axios = axios.create({
      baseURL: this.network.endpoint,
      headers: {
        'User-Agent': getUserAgent(),
      },
    })
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
