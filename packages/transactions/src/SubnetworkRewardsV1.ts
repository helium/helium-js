import proto from '@helium/proto'
import Transaction from './Transaction'
import {
  toAddressable,
  toNumber,
  toTicker,
  toTokenType,
  toUint8Array,
} from './utils'
import { Addressable, SignableKeypair } from './types'

interface Options {
  tokenType: string
  startEpoch: number
  endEpoch: number
  rewards: Array<SubnetworkReward>
  rewardServerSignature?: Uint8Array
}

interface SignOptions {
  keypair: SignableKeypair
}

export interface SubnetworkReward {
  account: Addressable
  amount: number
}

export default class SubnetworkRewardsV1 extends Transaction {
  public tokenType?: string

  public startEpoch?: number

  public endEpoch?: number

  public rewardServerSignature?: Uint8Array

  public rewards: Array<SubnetworkReward>

  public type: string = 'subnetwork_rewards_v1'

  constructor(opts: Options) {
    super()
    this.tokenType = opts.tokenType
    this.startEpoch = opts.startEpoch
    this.endEpoch = opts.endEpoch
    this.rewardServerSignature = opts.rewardServerSignature
    this.rewards = opts.rewards
  }

  serialize(): Uint8Array {
    const Txn = proto.helium.blockchain_txn
    const subnetworkRewards = this.toProto()
    const txn = Txn.create({ subnetworkRewards })
    return Txn.encode(txn).finish()
  }

  message(): Uint8Array {
    const SubnetworkRewards = proto.helium.blockchain_txn_subnetwork_rewards_v1
    const subnetworkRewards = this.toProto(true)
    return SubnetworkRewards.encode(subnetworkRewards).finish()
  }

  async sign({ keypair }: SignOptions): Promise<SubnetworkRewardsV1> {
    const serialized = this.message()
    this.rewardServerSignature = await keypair.sign(serialized)
    return this
  }

  static fromString(serializedTxnString: string) {
    const buf = Buffer.from(serializedTxnString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    const tokenType = toTicker(toNumber(decoded.subnetworkRewards?.tokenType))
    const startEpoch = toNumber(decoded.subnetworkRewards?.startEpoch) || 0
    const endEpoch = toNumber(decoded.subnetworkRewards?.endEpoch) || 0
    const rewards = (decoded.subnetworkRewards?.rewards || []).map((p) => ({
      account: toAddressable(p!.account) as Addressable,
      amount: toNumber(p!.amount) as number,
    }))
    const rewardServerSignature = toUint8Array(decoded.subnetworkRewards?.rewardServerSignature)

    return new SubnetworkRewardsV1({
      tokenType,
      startEpoch,
      endEpoch,
      rewards,
      rewardServerSignature,
    })
  }

  private toProto(forSigning: boolean = false): proto.helium.blockchain_txn_subnetwork_rewards_v1 {
    const SubnetworkRewards = proto.helium.blockchain_txn_subnetwork_rewards_v1
    const SubnetworkReward = proto.helium.blockchain_txn_subnetwork_reward_v1

    const rewards = this.rewards.map(({ account, amount }) => SubnetworkReward.create({
      account: toUint8Array(account?.bin),
      amount,
    }))

    return SubnetworkRewards.create({
      tokenType: toTokenType({ ticker: this.tokenType }),
      startEpoch: this.startEpoch,
      endEpoch: this.endEpoch,
      rewards,
      rewardServerSignature:
        this.rewardServerSignature && !forSigning ? toUint8Array(this.rewardServerSignature) : null,
    })
  }
}
