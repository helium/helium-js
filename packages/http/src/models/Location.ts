import Client from '../Client'
import DataModel from './DataModel'

export interface HTTPLocationObject {
  short_street?: string
  short_state?: string
  short_country?: string
  short_city?: string
  long_street?: string
  long_state?: string
  long_country?: string
  long_city?: string
  location: string
  city_id: string
}

export type LocationData = Omit<Location, 'client'>

export default class Location extends DataModel {
  private client: Client

  public shortStreet?: string

  public shortState?: string

  public shortCountry?: string

  public shortCity?: string

  public longStreet?: string

  public longState?: string

  public longCountry?: string

  public longCity?: string

  public location: string

  public cityId: string

  constructor(client: Client, data: HTTPLocationObject) {
    super()
    this.client = client
    this.shortStreet = data.short_street
    this.shortState = data.short_state
    this.shortCountry = data.short_country
    this.shortCity = data.short_city
    this.longStreet = data.long_street
    this.longState = data.long_state
    this.longCountry = data.long_country
    this.longCity = data.long_city
    this.location = data.location
    this.cityId = data.city_id
  }

  get data(): LocationData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}
