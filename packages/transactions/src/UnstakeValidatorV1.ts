import proto from '@helium/proto'
import Transaction from './Transaction'
import { toUint8Array, EMPTY_SIGNATURE } from './utils'
import { Addressable, SignableKeypair } from './types'

interface Options {
  address?: Addressable
  owner?: Addressable
  stakeAmount?: number
  stakeReleaseHeight?: number
  fee?: number
}

interface SignOptions {
  owner: SignableKeypair
}

export default class UnstakeValidatorV1 extends Transaction {
  public address?: Addressable

  public owner?: Addressable

  public stakeAmount?: number

  public stakeReleaseHeight?: number

  public fee?: number

  public ownerSignature?: Uint8Array

  public type: string = 'unstake_validator_v1'

  constructor(opts: Options) {
    super()
    this.address = opts.address
    this.owner = opts.owner
    this.stakeAmount = opts.stakeAmount
    this.stakeReleaseHeight = opts.stakeReleaseHeight
    if (opts.fee !== undefined) {
      this.fee = opts.fee
    } else {
      this.fee = 0
      this.fee = this.calculateFee()
    }
  }

  serialize(): Uint8Array {
    const Txn = proto.helium.blockchain_txn
    const unstakeValidator = this.toProto()
    const txn = Txn.create({ unstakeValidator })
    return Txn.encode(txn).finish()
  }

  async sign({ owner: ownerKeypair }: SignOptions): Promise<UnstakeValidatorV1> {
    const UnstakeValidator = proto.helium.blockchain_txn_stake_validator_v1
    const unstakeValidator = this.toProto(true)
    const serialized = UnstakeValidator.encode(unstakeValidator).finish()
    const signature = await ownerKeypair.sign(serialized)
    this.ownerSignature = signature
    return this
  }

  private toProto(
    forSigning: boolean = false,
  ): proto.helium.blockchain_txn_unstake_validator_v1 {
    const UnstakeValidator = proto.helium.blockchain_txn_unstake_validator_v1
    return UnstakeValidator.create({
      address: this.address ? toUint8Array(this.address.bin) : null,
      owner: this.owner ? toUint8Array(this.owner.bin) : null,
      stakeAmount: this.stakeAmount,
      stakeReleaseHeight: this.stakeReleaseHeight,
      fee: this.fee && this.fee > 0 ? this.fee : null,
      ownerSignature:
        this.ownerSignature && !forSigning ? toUint8Array(this.ownerSignature) : null,
    })
  }

  calculateFee(): number {
    this.ownerSignature = EMPTY_SIGNATURE
    const payload = this.serialize()
    return Transaction.calculateFee(payload)
  }
}
