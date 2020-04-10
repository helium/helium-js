import axios from 'axios'
import Transactions from './Transactions'

interface ClientOptions {
  endpoint?: string
  version?: number
}

export default class Client {
  public endpoint!: string
  public version!: number
  public transactions!: Transactions

  constructor({
    endpoint = 'https://api.helium.io',
    version = 1,
  }: ClientOptions = {}) {
    this.endpoint = endpoint
    this.version = version

    this.transactions = new Transactions(this)
  }

  async post(path: string, params: Object = {}) {
    const url = this.toUrl(path)
    return axios.post(url, params)
  }

  private toUrl(path: string): string {
    return [this.endpoint, `v${1}`, path.replace(/^\/+/, '')].join('/')
  }
}
