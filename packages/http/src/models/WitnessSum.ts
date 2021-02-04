import DataModel from './DataModel'
import Client from '../Client'

export type WitnessSumData = Omit<WitnessSum, 'client'>

export interface HTTPWitnessSum {
  timestamp: string
  stddev: number
  min: number
  median: number
  max: number
  avg: number
}

export class WitnessSum extends DataModel {
  private client: Client

  public timestamp: string

  public stddev: number

  public min: number

  public median: number

  public max: number

  public avg: number

  constructor(client: Client, witnessSum: HTTPWitnessSum) {
    super()
    this.client = client
    this.timestamp = witnessSum.timestamp
    this.stddev = witnessSum.stddev
    this.min = witnessSum.min
    this.median = witnessSum.median
    this.max = witnessSum.max
    this.avg = witnessSum.avg
  }

  get data(): WitnessSumData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}
