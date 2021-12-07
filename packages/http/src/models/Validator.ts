import Balance, { CurrencyType, NetworkTokens } from '../../../currency/build'
import type Client from '../Client'
import DataModel from './DataModel'
import Transactions from '../resources/Transactions'
import Rewards from '../resources/Rewards'
import Roles from '../resources/Roles'

export type ValidatorData = Omit<Validator, 'client'>

export type Bucket = 'hour' | 'day' | 'week'

export type NaturalDate = string // in the format "-${number} ${Bucket}" eg "-1 day"

export interface HTTPValidatorObject {
  version_heartbeat?: number
  status?: {
    height: number
    online: string
    listen_addrs: string[]
  }
  stake_status?: string
  stake?: number
  penalty?: number
  penalties?: Penalty[]
  owner?: string
  name?: string
  last_heartbeat?: number
  consensus_groups?: number
  block_added?: number
  block?: number
  address: string
}

export interface Penalty {
  type: string
  height: number
  amount: number
}

export interface Status {
  height: number
  online: string
  listenAddrs: string[]
}

export default class Validator extends DataModel {
  private client: Client

  public versionHeartbeat?: number

  public consensusGroups?: number

  public status?: Status

  public stakeStatus?: string

  public stake?: Balance<NetworkTokens>

  public penalty?: number

  public penalties?: Penalty[]

  public owner?: string

  public name?: string

  public lastHeartbeat?: number

  public blockAdded?: number

  public block?: number

  public address: string

  constructor(client: Client, validator: HTTPValidatorObject) {
    super()
    this.client = client
    this.versionHeartbeat = validator.version_heartbeat
    this.status = {
      height: validator.status?.height || 0,
      online: validator.status?.online || '',
      listenAddrs: validator.status?.listen_addrs || [],
    }
    this.stakeStatus = validator.stake_status
    this.stake = new Balance(validator.stake, CurrencyType.networkToken)
    this.penalty = validator.penalty
    this.penalties = validator.penalties
    this.owner = validator.owner
    this.name = validator.name
    this.lastHeartbeat = validator.last_heartbeat
    this.consensusGroups = validator.consensus_groups
    this.blockAdded = validator.block_added
    this.block = validator.block
    this.address = validator.address
  }

  public get activity(): Transactions {
    return new Transactions(this.client, this)
  }

  public get roles(): Roles {
    return new Roles(this.client, this)
  }

  public get rewards(): Rewards {
    return new Rewards(this.client, this)
  }

  get data(): ValidatorData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}
