import proto from '@helium/proto'
import Transaction from './Transaction'
import { toUint8Array } from './utils'
import { Addressable, SignableKeypair } from './types'

interface AddGatewayOptions {
  owner?: Addressable
  gateway?: Addressable
  payer?: Addressable
  ownerSignature?: Uint8Array | string
  gatewaySignature?: Uint8Array | string
  payerSignature?: Uint8Array | string
  stakingFee?: number
  fee?: number
}

interface SignOptions {
  owner?: SignableKeypair
  gateway?: SignableKeypair
  payer?: SignableKeypair
}

export default class AddGatewayV1 extends Transaction {
  public owner?: Addressable
  public gateway?: Addressable
  public payer?: Addressable
  public ownerSignature?: Uint8Array | string
  public gatewaySignature?: Uint8Array | string
  public payerSignature?: Uint8Array | string
  public stakingFee?: number
  public fee?: number

  constructor(opts: AddGatewayOptions) {
    super()
    this.owner = opts.owner
    this.gateway = opts.gateway
    this.payer = opts.payer
    this.stakingFee = opts.stakingFee
    this.fee = opts.fee
    this.ownerSignature = opts.ownerSignature
    this.gatewaySignature = opts.gatewaySignature
    this.payerSignature = opts.payerSignature
  }

  serialize(): Uint8Array {
    const Txn = proto.helium.blockchain_txn
    const addGateway = this.toProto()
    const txn = Txn.create({ addGateway })
    return Txn.encode(txn).finish()
  }

  async sign(keypairs: SignOptions): Promise<AddGatewayV1> {
    const AddGateway = proto.helium.blockchain_txn_add_gateway_v1
    const addGateway = this.toProto()
    const serialized = AddGateway.encode(addGateway).finish()

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

  private toProto(): proto.helium.blockchain_txn_add_gateway_v1 {
    const AddGateway = proto.helium.blockchain_txn_add_gateway_v1
    return AddGateway.create({
      owner: this.owner ? toUint8Array(this.owner.bin) : null,
      gateway: this.gateway ? toUint8Array(this.gateway.bin) : null,
      payer: this.payer ? toUint8Array(this.payer.bin) : null,
      ownerSignature: this.ownerSignature ? toUint8Array(this.ownerSignature) : null,
      gatewaySignature: this.gatewaySignature ? toUint8Array(this.gatewaySignature) : null,
      payerSignature: this.payerSignature ? toUint8Array(this.payerSignature) : null,
      stakingFee: this.stakingFee,
      fee: this.fee,
    })
  }
}
