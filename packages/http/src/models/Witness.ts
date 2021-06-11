import camelcaseKeys from 'camelcase-keys'
import type Client from '../Client'
import DataModel from './DataModel'

export type WitnessData = Omit<Witness, 'client'>

export type Bucket = 'hour' | 'day' | 'week'

export type NaturalDate = `-${number} ${Bucket}`

export interface HTTPWitnessObject {
  score_update_height?: number
  score?: number
  reward_scale?: number
  owner?: string
  name?: string
  location?: string
  location_hex?: string
  lng?: number
  lat?: number
  block?: number
  block_added?: number
  geocode?: HTTPGeocodeObject
  address: string
  status?: Status
  nonce?: number
  timestamp_added?: string
  last_poc_challenge?: number
  last_change_block?: number
  gain?: number
  elevation?: number
  witness_for?: string
  witness_info?: HTTPWitnessInfoObject
}

interface HTTPWitnessInfoObject {
  recent_time?: string
  histogram?: {
    '28'?: number
    '-92'?: number
    '-84'?: number
    '-76'?: number
    '-68'?: number
    '-60'?: number
    '-132'?: number
    '-124'?: number
    '-116'?: number
    '-108'?: number
    '-100'?: number
  }
  first_time?: string
}

interface WitnessInfo {
  recentTime?: string
  histogram?: {
    '28'?: number
    '-92'?: number
    '-84'?: number
    '-76'?: number
    '-68'?: number
    '-60'?: number
    '-132'?: number
    '-124'?: number
    '-116'?: number
    '-108'?: number
    '-100'?: number
  }
  firstTime?: string
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

export default class Witness extends DataModel {
  private client: Client

  public scoreUpdateHeight?: number

  public score?: number

  public rewardScale?: number

  public owner?: string

  public name?: string

  public location?: string

  public locationHex?: string

  public lng?: number

  public lat?: number

  public block?: number

  public geocode?: Geocode

  public address: string

  public status?: Status

  public nonce?: number

  public blockAdded?: number

  public timestampAdded?: string

  public lastPocChallenge?: number

  public lastChangeBlock?: number

  public gain?: number

  public elevation?: number

  public witnessFor?: string

  public witnessInfo?: WitnessInfo

  constructor(client: Client, witness: HTTPWitnessObject) {
    super()
    this.client = client
    this.scoreUpdateHeight = witness.score_update_height
    this.score = witness.score
    this.rewardScale = witness.reward_scale
    this.owner = witness.owner
    this.name = witness.name
    this.location = witness.location
    this.locationHex = witness.location_hex
    this.lng = witness.lng
    this.lat = witness.lat
    this.block = witness.block
    this.status = witness.status
    this.nonce = witness.nonce
    this.blockAdded = witness.block_added
    this.timestampAdded = witness.timestamp_added
    this.lastPocChallenge = witness.last_poc_challenge
    this.lastChangeBlock = witness.last_change_block
    this.gain = witness.gain
    this.elevation = witness.elevation
    if (witness.geocode) {
      this.geocode = camelcaseKeys(witness.geocode) as any
    }
    this.address = witness.address
    this.witnessFor = witness.witness_for
    if (witness.witness_info) {
      this.witnessInfo = camelcaseKeys(witness.witness_info) as any
    }
  }

  get data(): WitnessData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}
