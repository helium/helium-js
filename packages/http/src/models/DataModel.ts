/* eslint-disable @typescript-eslint/no-unused-vars */
import type Client from '../Client'

export default abstract class DataModel {
  protected client: Client

  constructor(client: Client) {
    this.client = client
  }

  get data(): Omit<this, 'client'> {
    const { client, ...rest } = this
    return { ...rest }
  }
}
