export interface HTTPCityObject {
  short_state: string
  short_country: string
  short_city: string
  long_state: string
  long_country: string
  long_city: string
  hotspot_count: number
  city_id: string
}

export default class City {
  public shortState: string
  public shortCountry: string
  public shortCity: string
  public longState: string
  public longCountry: string
  public longCity: string
  public hotspotCount: number
  public cityId: string

  constructor(data: HTTPCityObject) {
    this.shortState = data.short_state
    this.shortCountry = data.short_country
    this.shortCity = data.short_city
    this.longState = data.long_state
    this.longCountry = data.long_country
    this.longCity = data.long_city
    this.hotspotCount = data.hotspot_count
    this.cityId = data.city_id
  }
}
