import proto from '@helium/proto'
import Transaction from './Transaction'
import { EMPTY_SIGNATURE, toUint8Array } from './utils'
import { Addressable, SignableKeypair } from './types'

interface Options {
  tokenType: number
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
  public tokenType?: number

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

  async sign({ keypair }: SignOptions): Promise<SubnetworkRewardsV1> {
    const SubnetworkRewards = proto.helium.blockchain_txn_subnetwork_rewards_v1
    const subnetworkRewards = this.toProto()
    const serialized = SubnetworkRewards.encode(subnetworkRewards).finish()
    this.rewardServerSignature = await keypair.sign(serialized)
    return this
  }

  private toProto(forSigning: boolean = false): proto.helium.blockchain_txn_subnetwork_rewards_v1 {
    const SubnetworkRewards = proto.helium.blockchain_txn_subnetwork_rewards_v1
    const SubnetworkReward = proto.helium.blockchain_txn_subnetwork_reward_v1

    const rewards = this.rewards.map(({ account, amount }) => SubnetworkReward.create({
      account: toUint8Array(account?.bin),
      amount,
    }))

    return SubnetworkRewards.create({
      tokenType: this.tokenType,
      startEpoch: this.startEpoch,
      endEpoch: this.endEpoch,
      rewards,
      rewardServerSignature:
        this.rewardServerSignature && !forSigning ? toUint8Array(this.rewardServerSignature) : null,
    })
  }

  calculateFee(): number {
    this.rewardServerSignature = EMPTY_SIGNATURE
    const payload = this.serialize()
    return Transaction.calculateFee(payload)
  }
}
