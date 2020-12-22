import camelcaseKeys from 'camelcase-keys'
import type Client from '../Client'
import Transactions from '../resources/Transactions'
import Hotspots from '../resources/Hotspots'
import DataModel from './DataModel'
import HotspotRewards from '../resources/HotspotRewards'

export type HotspotData = Omit<Hotspot, 'client'>

export interface HTTPHotspotObject {
  score_update_height?: number
  score?: number
  owner?: string
  name?: string
  location?: string
  lng?: number
  lat?: number
  block?: number
  block_added?: number
  geocode?: HTTPGeocodeObject
  address: string
  status?: Status
  nonce?: number
  timestamp_added?: string
}

interface HTTPGeocodeObject {
  short_street: string
  short_state: string
  short_country: string
  short_city: string
  long_street: string
  long_state: string
  long_country: string
  long_city: string
}

interface Geocode {
  shortStreet: string
  shortState: string
  shortCountry: string
  shortCity: string
  longStreet: string
  longState: string
  longCountry: string
  longCity: string
}

interface Status {
  gps: string
  height: number
  online: string
}

export default class Hotspot extends DataModel {
  private client: Client

  public scoreUpdateHeight?: number

  public score?: number

  public owner?: string

  public name?: string

  public location?: string

  public lng?: number

  public lat?: number

  public block?: number

  public geocode?: Geocode

  public address: string

  public status?: Status

  public nonce?: number

  public blockAdded?: number

  public timestampAdded?: string

  constructor(client: Client, hotspot: HTTPHotspotObject) {
    super()
    this.client = client
    this.scoreUpdateHeight = hotspot.score_update_height
    this.score = hotspot.score
    this.owner = hotspot.owner
    this.name = hotspot.name
    this.location = hotspot.location
    this.lng = hotspot.lng
    this.lat = hotspot.lat
    this.block = hotspot.block
    this.status = hotspot.status
    this.nonce = hotspot.nonce
    this.blockAdded = hotspot.block_added
    this.timestampAdded = hotspot.timestamp_added
    if (hotspot.geocode) {
      this.geocode = camelcaseKeys(hotspot.geocode) as any
    }
    this.address = hotspot.address
  }

  public get activity(): Transactions {
    return new Transactions(this.client, this)
  }

  public get witnesses(): Hotspots {
    return new Hotspots(this.client, this)
  }

  public get rewards(): HotspotRewards {
    return new HotspotRewards(this.client, this.address)
  }

  get data(): HotspotData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}
