import qs from 'qs'
import fetch from 'isomorphic-fetch'
import Network from './Network'
import Transactions from './resources/Transactions'
import Blocks from './resources/Blocks'
import Accounts from './resources/Accounts'

export default class Client {
  public network!: Network

  public transactions!: Transactions
  public blocks!: Blocks
  public accounts!: Accounts

  constructor(network: Network = Network.production) {
    this.network = network

    this.transactions = new Transactions(this)
    this.blocks = new Blocks(this)
    this.accounts = new Accounts(this)
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
