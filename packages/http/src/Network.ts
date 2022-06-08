interface NetworkOptions {
  baseURL: string
  version: number
}

export default class Network {
  static production = new Network({
    baseURL: 'https://api.helium.io',
    version: 1,
  })

  static staging = new Network({
    baseURL: 'https://api.helium.wtf',
    version: 1,
  })

  static testnet = new Network({
    baseURL: 'https://testnet-api.helium.wtf',
    version: 1,
  })

  static devnet = new Network({
    baseURL: 'https://devnet-api.helium.wtf',
    version: 1,
  })

  public baseURL: string

  public version: number

  constructor({ baseURL, version }: NetworkOptions) {
    this.baseURL = baseURL
    this.version = version
  }

  get endpoint(): string {
    return [this.baseURL, `v${this.version}`].join('/')
  }
}
