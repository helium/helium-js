import camelcaseKeys from 'camelcase-keys'

export interface HTTPChallengeObject {
  type: string
  time: number
  signature: string
  secret: string
  path: HTTPPathObject[]
  onion_key_hash: string
  height: number
  hash: string
  fee: number
  challenger_owner: string
  challenger_lon: number
  challenger_loc: string
  challenger_lat: number
  challenger: string
}

interface HTTPPathObject {
  challengee: string
  witnesses: HTTPWitnessesObject[]
  receipt: HTTPReceiptObject
}

interface HTTPWitnessesObject {
  timestamp: number
  signal: number
  packet_hash: string
  gateway: string
}

interface HTTPReceiptObject {
  timestamp: number
  signature: string
  signal: number
  origin: string
  gateway: string
  data: string
}

interface Path {
  challengee: string
  witnesses: Witness[]
  receipt: Receipt
}

interface Witness {
  timestamp: number
  signal: number
  packetHash: string
  gateway: string
}

interface Receipt {
  timestamp: number
  signature: string
  signal: number
  origin: string
  gateway: string
  data: string
}

export default class Challenge {
  public type: string
  public time: number
  public signature: string
  public secret: string
  public path: Path[]
  public onionKeyHash: string
  public height: number
  public hash: string
  public fee: number
  public challengerOwner: string
  public challengerLon: number
  public challengerLoc: string
  public challengerLat: number
  public challenger: string

  constructor(challenge: HTTPChallengeObject) {
    this.type = challenge.type
    this.time = challenge.time
    this.signature = challenge.signature
    this.secret = challenge.secret
    this.path = camelcaseKeys(challenge.path) as any
    this.onionKeyHash = challenge.onion_key_hash
    this.height = challenge.height
    this.hash = challenge.hash
    this.fee = challenge.fee
    this.challengerOwner = challenge.challenger_owner
    this.challengerLon = challenge.challenger_lon
    this.challengerLoc = challenge.challenger_loc
    this.challengerLat = challenge.challenger_lat
    this.challenger = challenge.challenger
  }
}
