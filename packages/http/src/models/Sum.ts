import Balance, { CurrencyType, NetworkTokens } from '@helium/currency'
import DataModel from './DataModel'
import Client from '../Client'
import { SumsType } from '../resources/Sums'

export type SumData = Omit<Sum, 'client'>

export interface HTTPSum {
  total: number
  sum: number | string
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

  public balanceTotal: Balance<NetworkTokens>

  public stddev: number

  public balanceStddev: Balance<NetworkTokens>

  public min: number

  public balanceMin: Balance<NetworkTokens>

  public median: number

  public balanceMedian: Balance<NetworkTokens>

  public max: number

  public balanceMax: Balance<NetworkTokens>

  public avg: number

  public balanceAvg: Balance<NetworkTokens>

  public sum: number

  public balanceSum: Balance<NetworkTokens>

  public type: SumsType

  constructor(client: Client, rewards: HTTPSum, type: SumsType) {
    super()
    this.client = client
    this.type = type

    this.total = rewards.total
    this.balanceTotal = floatToBalance(rewards.total)

    this.stddev = rewards.stddev
    this.balanceStddev = floatToBalance(rewards.stddev)

    this.min = rewards.min
    this.balanceMin = floatToBalance(rewards.min)

    this.median = rewards.median
    this.balanceMedian = floatToBalance(rewards.median)

    this.max = rewards.max
    this.balanceMax = floatToBalance(rewards.max)

    this.avg = rewards.avg
    this.balanceAvg = floatToBalance(rewards.avg)

    const sumFloat = typeof rewards.sum === 'string' ? parseFloat(rewards.sum) : rewards.sum
    this.sum = sumFloat
    this.balanceSum = floatToBalance(sumFloat)
  }

  get data(): SumData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}
