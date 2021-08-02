import Transaction, { TxnJsonObject, StateChannelCloseV1 } from '../models/Transaction'
import type Client from '../Client'
import ResourceList from '../ResourceList'

interface ListParams {
  cursor?: string
}

export default class StateChannels {
  private client!: Client

  constructor(client: Client) {
    this.client = client
  }

  async list(params: ListParams = {}): Promise<ResourceList<StateChannelCloseV1>> {
    const url = '/state_channels'
    const response = await this.client.get(url, { cursor: params.cursor })
    const {
      data: { data: stateChannels, cursor },
    } = response
    const data = stateChannels.map((d: TxnJsonObject) => Transaction.fromJsonObject(d))
    return new ResourceList(data, this.list.bind(this), cursor)
  }
}
