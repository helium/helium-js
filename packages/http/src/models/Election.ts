import DataModel from './DataModel'

export interface HttpElectionObject {
  type: string
  time: number
  proof: string
  members: Array<string>
  height: number
  hash: string
  delay: number
}

export type ElectionData = Election

export default class Election extends DataModel {
  type: string

  time: number

  proof: string

  members: Array<string>

  height: number

  hash: string

  delay: number

  constructor(data: HttpElectionObject) {
    super()
    this.type = data.type
    this.time = data.time
    this.proof = data.proof
    this.members = data.members
    this.height = data.height
    this.hash = data.hash
    this.delay = data.delay
  }

  get data(): ElectionData {
    return this
  }
}
