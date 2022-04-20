import proto from '@helium/proto'
import Transaction from './Transaction'
import {
  toUint8Array, EMPTY_SIGNATURE, toAddressable, toNumber,
} from './utils'
import { Addressable, SignableKeypair } from './types'

interface AssertLocationOptions {
  owner?: Addressable
  gateway?: Addressable
  payer?: Addressable
  location?: string
  nonce?: number
  gain?: number
  elevation?: number
  fee?: number
  stakingFee?: number
  ownerSignature?: Uint8Array
  payerSignature?: Uint8Array
}

interface SignOptions {
  owner?: SignableKeypair
  payer?: SignableKeypair
}

export default class AssertLocationV2 extends Transaction {
  public owner?: Addressable

  public gateway?: Addressable

  public payer?: Addressable

  public location?: string

  public nonce?: number

  public gain?: number

  public elevation?: number

  public fee?: number

  public stakingFee?: number

  public ownerSignature?: Uint8Array

  public payerSignature?: Uint8Array

  public type: string = 'assert_location_v2'

  constructor(opts: AssertLocationOptions) {
    super()

    const {
      owner,
      gateway,
      payer,
      location,
      nonce,
      gain,
      elevation,
      stakingFee,
      fee,
      ownerSignature,
      payerSignature,
    } = opts

    this.owner = owner
    this.gateway = gateway
    this.payer = payer
    this.location = location
    this.nonce = nonce
    this.gain = gain
    this.elevation = elevation
    this.stakingFee = 0
    this.fee = 0

    if (fee !== undefined) {
      this.fee = fee
    } else {
      this.fee = this.calculateFee()
    }
    if (stakingFee !== undefined) {
      this.stakingFee = stakingFee
    } else {
      // v2 reuses the v1 staking fee chain var
      this.stakingFee = Transaction.stakingFeeTxnAssertLocationV1
    }

    if (ownerSignature) this.ownerSignature = ownerSignature
    if (payerSignature) this.payerSignature = payerSignature
  }

  serialize(): Uint8Array {
    const Txn = proto.helium.blockchain_txn
    const assertLocationV2 = this.toProto()
    const txn = Txn.create({ assertLocationV2 })
    return Txn.encode(txn).finish()
  }

  static fromString(serializedTxnString: string): AssertLocationV2 {
    const buf = Buffer.from(serializedTxnString, 'base64')
    const { assertLocationV2 } = proto.helium.blockchain_txn.decode(buf)

    const owner = assertLocationV2?.owner?.length
      ? toAddressable(assertLocationV2?.owner)
      : undefined
    const gateway = assertLocationV2?.gateway?.length
      ? toAddressable(assertLocationV2?.gateway)
      : undefined
    const payer = assertLocationV2?.payer?.length
      ? toAddressable(assertLocationV2?.payer)
      : undefined

    const location = assertLocationV2?.location || undefined
    const nonce = toNumber(assertLocationV2?.nonce)
    const gain = toNumber(assertLocationV2?.gain)
    const elevation = toNumber(assertLocationV2?.elevation)

    const ownerSignature = assertLocationV2?.ownerSignature?.length
      ? toUint8Array(assertLocationV2?.ownerSignature)
      : undefined
    const payerSignature = assertLocationV2?.payerSignature?.length
      ? toUint8Array(assertLocationV2?.payerSignature)
      : undefined

    const fee = toNumber(assertLocationV2?.fee)
    const stakingFee = toNumber(assertLocationV2?.stakingFee)

    return new AssertLocationV2({
      owner,
      gateway,
      payer,
      location,
      nonce,
      gain,
      elevation,
      fee,
      stakingFee,
      ownerSignature,
      payerSignature,
    })
  }

  async sign(keypairs: SignOptions): Promise<AssertLocationV2> {
    const AssertLocation = proto.helium.blockchain_txn_assert_location_v2
    const assertLocation = this.toProto(true)
    const serialized = AssertLocation.encode(assertLocation).finish()

    if (keypairs.owner) {
      const signature = await keypairs.owner.sign(serialized)
      this.ownerSignature = signature
    }

    if (keypairs.payer) {
      const signature = await keypairs.payer.sign(serialized)
      this.payerSignature = signature
    }

    return this
  }

  private toProto(forSigning: boolean = false): proto.helium.blockchain_txn_assert_location_v2 {
    const AssertLocation = proto.helium.blockchain_txn_assert_location_v2
    return AssertLocation.create({
      owner: this.owner ? toUint8Array(this.owner.bin) : null,
      gateway: this.gateway ? toUint8Array(this.gateway.bin) : null,
      payer: this.payer ? toUint8Array(this.payer.bin) : null,
      location: this.location,
      nonce: this.nonce,
      gain: this.gain,
      elevation: this.elevation && this.elevation > 0 ? this.elevation : null,
      fee: this.fee && this.fee > 0 ? this.fee : null,
      stakingFee: this.stakingFee && this.stakingFee > 0 ? this.stakingFee : null,
      ownerSignature: this.ownerSignature && !forSigning ? toUint8Array(this.ownerSignature) : null,
      payerSignature: this.payerSignature && !forSigning ? toUint8Array(this.payerSignature) : null,
    })
  }

  calculateFee(): number {
    this.ownerSignature = EMPTY_SIGNATURE
    if (this.payer) {
      this.payerSignature = EMPTY_SIGNATURE
    }
    const payload = this.serialize()
    return Transaction.calculateFee(payload)
  }
}
