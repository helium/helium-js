import proto from '@helium/proto'
import Transaction from './Transaction'
import { toUint8Array, EMPTY_SIGNATURE } from './utils'
import { Addressable, SignableKeypair } from './types'

interface Options {
  address?: Addressable
  owner?: Addressable
  stake?: number
  fee?: number
}

interface SignOptions {
  owner: SignableKeypair
}

export default class StakeValidatorV1 extends Transaction {
  public address?: Addressable

  public owner?: Addressable

  public stake?: number

  public fee?: number

  public ownerSignature?: Uint8Array

  public type: string = 'stake_validator_v1'

  constructor(opts: Options) {
    super()
    this.address = opts.address
    this.owner = opts.owner
    this.stake = opts.stake
    if (opts.fee !== undefined) {
      this.fee = opts.fee
    } else {
      this.fee = 0
      this.fee = this.calculateFee()
    }
  }

  serialize(): Uint8Array {
    const Txn = proto.helium.blockchain_txn
    const stakeValidator = this.toProto()
    const txn = Txn.create({ stakeValidator })
    return Txn.encode(txn).finish()
  }

  async sign({ owner: ownerKeypair }: SignOptions): Promise<StakeValidatorV1> {
    const StakeValidator = proto.helium.blockchain_txn_stake_validator_v1
    const stakeValidator = this.toProto(true)
    const serialized = StakeValidator.encode(stakeValidator).finish()
    const signature = await ownerKeypair.sign(serialized)
    this.ownerSignature = signature
    return this
  }

  private toProto(
    forSigning: boolean = false,
  ): proto.helium.blockchain_txn_stake_validator_v1 {
    const StakeValidator = proto.helium.blockchain_txn_stake_validator_v1
    return StakeValidator.create({
      address: this.address ? toUint8Array(this.address.bin) : null,
      owner: this.owner ? toUint8Array(this.owner.bin) : null,
      stake: this.stake,
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
