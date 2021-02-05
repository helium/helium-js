import Balance, { CurrencyType, NetworkTokens } from '@helium/currency'
import DataModel from './DataModel'
import Client from '../Client'

export type SumData = Omit<Sum, 'client'>

export interface HTTPSum {
  total: number
  sum: number | string
  timestamp: string
  stddev: number
  min: number
  median: number
  max: number
  avg: number
}

function floatToBalance(floatValue: number): Balance<NetworkTokens> {
  return Balance.fromFloat(floatValue, CurrencyType.networkToken)
}

export default class Sum extends DataModel {
  private client: Client

  public total: number

  public stddev: number

  public min: number

  public median: number

  public max: number

  public avg: number

  public sum: number

  public timestamp: string

  constructor(client: Client, data: HTTPSum) {
    super()
    this.client = client
    this.total = data.total
    this.stddev = data.stddev
    this.min = data.min
    this.median = data.median
    this.max = data.max
    this.avg = data.avg
    this.timestamp = data.timestamp
    this.sum = typeof data.sum === 'string' ? parseFloat(data.sum) : data.sum
  }

  get balanceTotal() {
    return floatToBalance(this.total)
  }

  get balanceStddev() {
    return floatToBalance(this.stddev)
  }

  get balanceMin() {
    return floatToBalance(this.min)
  }

  get balanceMedian() {
    return floatToBalance(this.median)
  }

  get balanceMax() {
    return floatToBalance(this.max)
  }

  get balanceAvg() {
    return floatToBalance(this.avg)
  }

  get balanceSum() {
    return new Balance(this.sum, CurrencyType.networkToken)
  }

  get data(): SumData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}
