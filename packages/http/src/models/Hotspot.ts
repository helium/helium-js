import camelcaseKeys from 'camelcase-keys'
import type Client from '../Client'
import Transactions from '../resources/Transactions'

export interface HTTPHotspotObject {
  score_update_height?: number
  score?: number
  owner?: string
  name?: string
  location?: string
  lng?: number
  lat?: number
  block?: number
  geocode?: HTTPGeocodeObject
  address: string
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

export default class Hotspot {
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

  constructor(client: Client, hotspot: HTTPHotspotObject) {
    this.client = client
    this.scoreUpdateHeight = hotspot.score_update_height
    this.score = hotspot.score
    this.owner = hotspot.owner
    this.name = hotspot.name
    this.location = hotspot.location
    this.lng = hotspot.lng
    this.lat = hotspot.lat
    this.block = hotspot.block
    if (hotspot.geocode) {
      this.geocode = camelcaseKeys(hotspot.geocode) as any
    }
    this.address = hotspot.address
  }

  public get activity(): Transactions {
    return new Transactions(this.client, this)
  }
}
