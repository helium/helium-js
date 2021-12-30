import type Client from '../Client'
import ResourceList from '../ResourceList'
import Sums, { SumsType } from './Sums'
import Hotspot from '../models/Hotspot'
import Witness, { HTTPWitnessObject } from '../models/Witness'

interface ListParams {
  cursor?: string
}

type WitnessType = 'witnesses' | 'witnessed'

export default class Witnesses {
  private client!: Client

  private hotspot: Hotspot

  private type: WitnessType

  constructor(client: Client, hotspot: Hotspot, type: WitnessType = 'witnesses') {
    this.client = client
    this.hotspot = hotspot
    this.type = type
  }

  async list(params: ListParams = {}): Promise<ResourceList<Witness>> {
    const url = `/hotspots/${this.hotspot.address}/${this.type}`
    const {
      data: { data: witnesses, cursor },
    } = await this.client.get(url, { cursor: params.cursor })
    const data = witnesses.map((witness: HTTPWitnessObject) => new Witness(this.client, witness))
    return new ResourceList(data, this.list.bind(this), cursor)
  }

  public get sum() {
    return new Sums(this.client, SumsType.witnesses, this.hotspot)
  }
}
