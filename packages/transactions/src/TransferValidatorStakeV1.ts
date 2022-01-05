import proto from '@helium/proto'
import Transaction from './Transaction'
import { toUint8Array, EMPTY_SIGNATURE } from './utils'
import { Addressable, SignableKeypair } from './types'

interface Options {
  oldAddress?: Addressable
  newAddress?: Addressable
  oldOwner?: Addressable
  newOwner?: Addressable
  fee?: number
  stakeAmount?: number
  paymentAmount?: number
}

interface SignOptions {
  oldOwner?: SignableKeypair
  newOwner?: SignableKeypair
}

export default class TransferValidatorStakeV1 extends Transaction {
  public oldAddress?: Addressable

  public newAddress?: Addressable

  public oldOwner?: Addressable

  public newOwner?: Addressable

  public stakeAmount?: number

  public paymentAmount?: number

  public fee?: number

  public oldOwnerSignature?: Uint8Array

  public newOwnerSignature?: Uint8Array

  public type: string = 'transfer_validator_stake_v1'

  constructor(opts: Options) {
    super()
    this.oldAddress = opts.oldAddress
    this.newAddress = opts.newAddress
    this.oldOwner = opts.oldOwner
    this.newOwner = opts.newOwner
    this.stakeAmount = opts.stakeAmount
    this.paymentAmount = opts.paymentAmount
    if (opts.fee !== undefined) {
      this.fee = opts.fee
    } else {
      this.fee = 0
      this.fee = this.calculateFee()
    }
  }

  serialize(): Uint8Array {
    const Txn = proto.helium.blockchain_txn
    const transferValStake = this.toProto()
    const txn = Txn.create({ transferValStake })
    return Txn.encode(txn).finish()
  }

  async sign(keypairs: SignOptions): Promise<TransferValidatorStakeV1> {
    const TransferValStake = proto.helium.blockchain_txn_transfer_validator_stake_v1
    const transferValStake = this.toProto(true)
    const serialized = TransferValStake.encode(transferValStake).finish()

    if (keypairs.oldOwner) {
      this.oldOwnerSignature = await keypairs.oldOwner.sign(serialized)
    }

    if (keypairs.newOwner) {
      this.newOwnerSignature = await keypairs.newOwner.sign(serialized)
    }

    return this
  }

  private toProto(
    forSigning: boolean = false,
  ): proto.helium.blockchain_txn_transfer_validator_stake_v1 {
    const TransferValStake = proto.helium.blockchain_txn_transfer_validator_stake_v1
    return TransferValStake.create({
      oldAddress: this.oldAddress ? toUint8Array(this.oldAddress.bin) : null,
      newAddress: this.newAddress ? toUint8Array(this.newAddress.bin) : null,
      oldOwner: this.oldOwner ? toUint8Array(this.oldOwner.bin) : null,
      newOwner: this.newOwner ? toUint8Array(this.newOwner.bin) : null,
      stakeAmount: this.stakeAmount,
      paymentAmount: this.paymentAmount && this.paymentAmount > 0 ? this.paymentAmount : null,
      fee: this.fee && this.fee > 0 ? this.fee : null,
      oldOwnerSignature:
        this.oldOwnerSignature && !forSigning ? toUint8Array(this.oldOwnerSignature) : null,
      newOwnerSignature:
        this.newOwnerSignature && !forSigning ? toUint8Array(this.newOwnerSignature) : null,
    })
  }

  calculateFee(): number {
    this.oldOwnerSignature = EMPTY_SIGNATURE
    this.newOwnerSignature = EMPTY_SIGNATURE
    const payload = this.serialize()
    return Transaction.calculateFee(payload)
  }
}
