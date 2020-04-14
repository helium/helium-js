interface NetworkOptions {
  endpoint: string
  version: number
}

export default class Network {
  static production = new Network({
    endpoint: 'https://api.helium.io',
    version: 1,
  })

  static staging = new Network({
    endpoint: 'https://api.helium.wtf',
    version: 1,
  })

  public endpoint: string
  public version: number

  constructor({ endpoint, version }: NetworkOptions) {
    this.endpoint = endpoint
    this.version = version
  }
}
