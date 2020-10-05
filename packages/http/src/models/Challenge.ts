export interface HTTPChallengeObject {
  type: string
  time: number
  secret: string
  request_block_hash: string
  path: HTTPPathObject[]
  onion_key_hash: string
  height: number
  hash: string
  fee: number
  challenger_owner: string
  challenger_lon: number
  challenger_location: string
  challenger_lat: number
  challenger: string
}

interface HTTPPathObject {
  witnesses: HTTPWitnessesObject[]
  receipt: HTTPReceiptObject
  geocode: HTTPGeocodeObject
  challengee_owner: string
  challengee_lon: string
  challengee_location: string
  challengee_lat: string
  challengee: string
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
  city_id: string
}

interface HTTPWitnessesObject {
  timestamp: number
  snr: number
  signal: number
  packet_hash: string
  owner: string
  location: string
  is_valid: boolean
  gateway: string
  frequency: number
  datarate: number[]
  channel: number
}

interface HTTPReceiptObject {
  timestamp: number
  snr: number
  signal: number
  origin: string
  gateway: string
  frequency: number
  datarate: number[]
  data: string
  channel: number
}

export interface Geocode {
  shortStreet: string
  shortState: string
  shortCountry: string
  shortCity: string
  longStreet: string
  longState: string
  longCountry: string
  longCity: string
  cityId: string
}

export enum PathResult {
  SUCCESS = 'success',
  FAILURE = 'failure',
  UNTESTED = 'untested',
}

export interface Path {
  witnesses: Witness[]
  receipt: Receipt
  geocode: Geocode
  challengeeOwner: string
  challengeeLon: string
  challengeeLocation: string
  challengeeLat: string
  challengee: string
  result: PathResult
}

export interface Witness {
  timestamp: number
  snr: number
  signal: number
  packetHash: string
  owner: string
  location: string
  isValid: boolean
  gateway: string
  frequency: number
  datarate: number[]
  channel: number
}

export interface Receipt {
  timestamp: number
  snr: number
  signal: number
  origin: string
  gateway: string
  frequency: number
  datarate: number[]
  data: string
  channel: number
}

const constructPath = (path: HTTPPathObject[]): Path[] => {
  let hasFailedPath = false
  const isBeacon = path.length === 1
  return path.map((pathObject, i) => {
    const hasReceipt = pathObject.receipt
    const hasGeocode = pathObject.geocode
    const hasWitness = pathObject.witnesses.length > 0
    const hasReceiptOrWitnesses = hasReceipt || hasWitness
    const hasReceiptAndWitnesses = hasReceipt && hasWitness
    const nextElement = path[i + 1]
    const nextElementHasReceiptOrWitness = nextElement && (nextElement.receipt
        || nextElement.witnesses.length > 0)
    const isFirstElement = i === 0
    const isValidBeacon = isBeacon && hasReceipt && hasWitness
    const isValidChallenge = !isBeacon && (
      isFirstElement
        ? (hasReceiptAndWitnesses || nextElementHasReceiptOrWitness)
        : (hasReceiptOrWitnesses || nextElementHasReceiptOrWitness)
    )
    const isFailure = isFirstElement ? !hasWitness : !hasReceipt && !hasWitness
    let result: PathResult = PathResult.UNTESTED
    if (!hasFailedPath && (isValidBeacon || isValidChallenge)) {
      result = PathResult.SUCCESS
    } else if (!hasFailedPath && isFailure) {
      result = PathResult.FAILURE
      hasFailedPath = true
    }
    return {
      witnesses: hasWitness ? pathObject.witnesses.map((witness) => ({
        timestamp: witness.timestamp,
        snr: witness.snr,
        signal: witness.signal,
        packetHash: witness.packet_hash,
        owner: witness.owner,
        location: witness.location,
        isValid: witness.is_valid,
        gateway: witness.gateway,
        frequency: witness.frequency,
        datarate: witness.datarate,
        channel: witness.channel,
      } as Witness)) as Witness[] : [],
      receipt: hasReceipt ? {
        timestamp: pathObject.receipt.timestamp,
        snr: pathObject.receipt.snr,
        signal: pathObject.receipt.signal,
        origin: pathObject.receipt.origin,
        gateway: pathObject.receipt.gateway,
        frequency: pathObject.receipt.frequency,
        datarate: pathObject.receipt.datarate,
        data: pathObject.receipt.data,
        channel: pathObject.receipt.channel,
      } as Receipt : undefined,
      geocode: hasGeocode ? {
        shortStreet: pathObject.geocode.short_street,
        shortState: pathObject.geocode.short_state,
        shortCountry: pathObject.geocode.short_country,
        shortCity: pathObject.geocode.short_city,
        longStreet: pathObject.geocode.long_street,
        longState: pathObject.geocode.long_state,
        longCountry: pathObject.geocode.long_country,
        longCity: pathObject.geocode.long_city,
        cityId: pathObject.geocode.city_id,
      } as Geocode : undefined,
      challengeeOwner: pathObject.challengee_owner,
      challengeeLon: pathObject.challengee_lon,
      challengeeLocation: pathObject.challengee_location,
      challengeeLat: pathObject.challengee_lat,
      challengee: pathObject.challengee,
      result,
    } as Path
  })
}

export default class Challenge {
  public type: string
  public time: number
  public secret: string
  public requestBlockHash: string
  public path: Path[]
  public onionKeyHash: string
  public height: number
  public hash: string
  public fee: number
  public challengerOwner: string
  public challengerLon: number
  public challengerLocation: string
  public challengerLat: number
  public challenger: string

  constructor(challenge: HTTPChallengeObject) {
    this.type = challenge.type
    this.time = challenge.time
    this.secret = challenge.secret
    this.requestBlockHash = challenge.request_block_hash
    this.path = constructPath(challenge.path)
    this.onionKeyHash = challenge.onion_key_hash
    this.height = challenge.height
    this.hash = challenge.hash
    this.fee = challenge.fee
    this.challengerOwner = challenge.challenger_owner
    this.challengerLon = challenge.challenger_lon
    this.challengerLocation = challenge.challenger_location
    this.challengerLat = challenge.challenger_lat
    this.challenger = challenge.challenger
  }
}
