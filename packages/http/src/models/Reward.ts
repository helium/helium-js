import Balance, { CurrencyType, NetworkTokens } from '@helium/currency'
import DataModel from './DataModel'
import Client from '../Client'

export type RewardData = Omit<Reward, 'client'>

export interface HTTPReward {
  account: string
  amount: number
  block: number
  gateway: string
  hash: string
  timestamp: string
}

function integerToBalance(integerValue: number): Balance<NetworkTokens> {
  return new Balance(integerValue, CurrencyType.networkToken)
}

export default class Reward extends DataModel {
  private client: Client

  public account: string

  public amount: Balance<NetworkTokens>

  public block: number

  public gateway: string

  public hash: string

  public timestamp: string

  constructor(client: Client, rewards: HTTPReward) {
    super()
    this.client = client
    this.account = rewards.account
    this.amount = integerToBalance(rewards.amount)
    this.block = rewards.block
    this.gateway = rewards.gateway
    this.hash = rewards.hash
    this.timestamp = rewards.timestamp
  }

  get data(): RewardData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}
