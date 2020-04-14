import axios from 'axios'
import Network from './Network'
import Transactions from './resources/Transactions'
import Blocks from './resources/Blocks'

export default class Client {
  public network!: Network
  public transactions!: Transactions
  public blocks!: Blocks

  constructor(network: Network = Network.production) {
    this.network = network

    this.transactions = new Transactions(this)
    this.blocks = new Blocks(this)

    // this.axios = axios.create({
    //   baseURL: slackApiUrl,
    //   headers: Object.assign(
    //     {
    //       'User-Agent': getUserAgent(),
    //     },
    //     headers,
    //   ),
    //   httpAgent: agent,
    //   httpsAgent: agent,
    //   transformRequest: [this.serializeApiCallOptions.bind(this)],
    //   validateStatus: () => true, // all HTTP status codes should result in a resolved promise (as opposed to only 2xx)
    //   maxRedirects: 0,
    //   // disabling axios' automatic proxy support:
    //   // axios would read from envvars to configure a proxy automatically, but it doesn't support TLS destinations.
    //   // for compatibility with https://api.slack.com, and for a larger set of possible proxies (SOCKS or other
    //   // protocols), users of this package should use the `agent` option to configure a proxy.
    //   proxy: false,
    // });
  }

  async get(path: string) {
    const url = this.toUrl(path)
    return axios.get(url)
  }

  async post(path: string, params: Object = {}) {
    const url = this.toUrl(path)
    return axios.post(url, params)
  }

  private toUrl(path: string): string {
    return [
      this.network.endpoint,
      `v${this.network.version}`,
      path.replace(/^\/+/, ''),
    ].join('/')
  }
}
