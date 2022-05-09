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
  fee?: number
  stakingFee?: number
  ownerSignature?: Uint8Array
  gatewaySignature?: Uint8Array
  payerSignature?: Uint8Array
}

interface SignOptions {
  owner?: SignableKeypair
  gateway?: SignableKeypair
  payer?: SignableKeypair
}

export default class AssertLocationV1 extends Transaction {
  public owner?: Addressable

  public gateway?: Addressable

  public payer?: Addressable

  public ownerSignature?: Uint8Array

  public gatewaySignature?: Uint8Array

  public payerSignature?: Uint8Array

  public stakingFee?: number

  public fee?: number

  public location?: string

  public nonce?: number

  public type: string = 'assert_location_v1'

  constructor(opts: AssertLocationOptions) {
    super()

    const {
      owner,
      gateway,
      payer,
      location,
      nonce,
      stakingFee,
      fee,
      ownerSignature,
      gatewaySignature,
      payerSignature,
    } = opts

    this.owner = owner
    this.gateway = gateway
    this.payer = payer
    this.location = location
    this.nonce = nonce
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
      this.stakingFee = Transaction.stakingFeeTxnAssertLocationV1
    }

    if (ownerSignature) this.ownerSignature = ownerSignature
    if (gatewaySignature) this.gatewaySignature = gatewaySignature
    if (payerSignature) this.payerSignature = payerSignature
  }

  serialize(): Uint8Array {
    const Txn = proto.helium.blockchain_txn
    const assertLocation = this.toProto()
    const txn = Txn.create({ assertLocation })
    return Txn.encode(txn).finish()
  }

  static fromString(serializedTxnString: string): AssertLocationV1 {
    const buf = Buffer.from(serializedTxnString, 'base64')
    const { assertLocation } = proto.helium.blockchain_txn.decode(buf)

    const owner = assertLocation?.owner?.length ? toAddressable(assertLocation?.owner) : undefined
    const gateway = assertLocation?.gateway?.length
      ? toAddressable(assertLocation?.gateway)
      : undefined
    const payer = assertLocation?.payer?.length ? toAddressable(assertLocation?.payer) : undefined

    const location = assertLocation?.location || undefined
    const nonce = toNumber(assertLocation?.nonce)

    const ownerSignature = assertLocation?.ownerSignature?.length
      ? toUint8Array(assertLocation?.ownerSignature)
      : undefined
    const gatewaySignature = assertLocation?.gatewaySignature?.length
      ? toUint8Array(assertLocation?.gatewaySignature)
      : undefined
    const payerSignature = assertLocation?.payerSignature?.length
      ? toUint8Array(assertLocation?.payerSignature)
      : undefined

    const fee = toNumber(assertLocation?.fee)
    const stakingFee = toNumber(assertLocation?.stakingFee)

    return new AssertLocationV1({
      owner,
      gateway,
      payer,
      location,
      nonce,
      fee,
      stakingFee,
      ownerSignature,
      gatewaySignature,
      payerSignature,
    })
  }

  async sign(keypairs: SignOptions): Promise<AssertLocationV1> {
    const AssertLocation = proto.helium.blockchain_txn_assert_location_v1
    const assertLocation = this.toProto(true)
    const serialized = AssertLocation.encode(assertLocation).finish()

    if (keypairs.owner) {
      const signature = await keypairs.owner.sign(serialized)
      this.ownerSignature = signature
    }

    if (keypairs.gateway) {
      const signature = await keypairs.gateway.sign(serialized)
      this.gatewaySignature = signature
    }

    if (keypairs.payer) {
      const signature = await keypairs.payer.sign(serialized)
      this.payerSignature = signature
    }

    return this
  }

  private toProto(forSigning: boolean = false): proto.helium.blockchain_txn_assert_location_v1 {
    const AssertLocation = proto.helium.blockchain_txn_assert_location_v1
    return AssertLocation.create({
      owner: this.owner ? toUint8Array(this.owner.bin) : null,
      gateway: this.gateway ? toUint8Array(this.gateway.bin) : null,
      payer: this.payer ? toUint8Array(this.payer.bin) : null,
      ownerSignature: this.ownerSignature && !forSigning ? toUint8Array(this.ownerSignature) : null,
      gatewaySignature:
        this.gatewaySignature && !forSigning ? toUint8Array(this.gatewaySignature) : null,
      payerSignature: this.payerSignature && !forSigning ? toUint8Array(this.payerSignature) : null,
      stakingFee: this.stakingFee && this.stakingFee > 0 ? this.stakingFee : null,
      fee: this.fee && this.fee > 0 ? this.fee : null,
      location: this.location,
      nonce: this.nonce,
    })
  }

  calculateFee(): number {
    this.ownerSignature = EMPTY_SIGNATURE
    this.gatewaySignature = EMPTY_SIGNATURE
    if (this.payer) {
      this.payerSignature = EMPTY_SIGNATURE
    }
    const payload = this.serialize()
    return Transaction.calculateFee(payload)
  }
}
