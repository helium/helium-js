import Client from '../Client'

// TODO need subclasses?
export default class Transaction {
  public client: Client
  public data: object

  constructor(client: Client, data: object) {
    this.client = client
    this.data = data
  }
}
