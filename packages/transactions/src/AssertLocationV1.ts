import proto from '@helium/proto'
import Transaction from './Transaction'
import { toUint8Array } from './utils'
import { Addressable, SignableKeypair } from './types'

interface AssertLocationOptions {
  owner?: Addressable
  gateway?: Addressable
  payer?: Addressable
  ownerSignature?: Uint8Array | string
  gatewaySignature?: Uint8Array | string
  payerSignature?: Uint8Array | string
  stakingFee?: number
  fee?: number
  location?: string
  nonce?: number
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
  public ownerSignature?: Uint8Array | string
  public gatewaySignature?: Uint8Array | string
  public payerSignature?: Uint8Array | string
  public stakingFee?: number
  public fee?: number
  public location?: string
  public nonce?: number

  constructor(opts: AssertLocationOptions) {
    super()
    this.owner = opts.owner
    this.gateway = opts.gateway
    this.payer = opts.payer
    this.ownerSignature = opts.ownerSignature
    this.gatewaySignature = opts.gatewaySignature
    this.payerSignature = opts.payerSignature
    this.stakingFee = opts.stakingFee
    this.fee = opts.fee
    this.location = opts.location
    this.nonce = opts.nonce
  }

  serialize(): Uint8Array {
    const Txn = proto.helium.blockchain_txn
    const assertLocation = this.toProto()
    const txn = Txn.create({ assertLocation })
    return Txn.encode(txn).finish()
  }

  async sign(keypairs: SignOptions): Promise<AssertLocationV1> {
    const AssertLocation = proto.helium.blockchain_txn_assert_location_v1
    const assertLocation = this.toProto()
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

  private toProto(): proto.helium.blockchain_txn_assert_location_v1 {
    const AssertLocation = proto.helium.blockchain_txn_assert_location_v1
    return AssertLocation.create({
      owner: this.owner ? toUint8Array(this.owner.bin) : null,
      gateway: this.gateway ? toUint8Array(this.gateway.bin) : null,
      payer: this.payer ? toUint8Array(this.payer.bin) : null,
      ownerSignature: this.ownerSignature ? toUint8Array(this.ownerSignature) : null,
      gatewaySignature: this.gatewaySignature ? toUint8Array(this.gatewaySignature) : null,
      payerSignature: this.payerSignature ? toUint8Array(this.payerSignature) : null,
      stakingFee: this.stakingFee,
      fee: this.fee,
      location: this.location,
      nonce: this.nonce,
    })
  }
}
