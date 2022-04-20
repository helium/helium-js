import proto from '@helium/proto'
import Transaction from './Transaction'
import {
  EMPTY_SIGNATURE, toAddressable, toNumber, toUint8Array,
} from './utils'
import { Addressable, SignableKeypair } from './types'

interface AddGatewayOptions {
  owner?: Addressable
  gateway?: Addressable
  payer?: Addressable
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

export default class AddGatewayV1 extends Transaction {
  public owner?: Addressable

  public gateway?: Addressable

  public payer?: Addressable

  public ownerSignature?: Uint8Array

  public gatewaySignature?: Uint8Array

  public payerSignature?: Uint8Array

  public stakingFee?: number

  public fee?: number

  public type: string = 'add_gateway_v1'

  constructor(opts: AddGatewayOptions) {
    super()

    const {
      owner,
      gateway,
      payer,
      stakingFee,
      fee,
      ownerSignature,
      gatewaySignature,
      payerSignature,
    } = opts

    this.owner = owner
    this.gateway = gateway
    this.payer = payer
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
      this.stakingFee = Transaction.stakingFeeTxnAddGatewayV1
    }

    if (ownerSignature) this.ownerSignature = ownerSignature
    if (gatewaySignature) this.gatewaySignature = gatewaySignature
    if (payerSignature) this.payerSignature = payerSignature
  }

  serialize(): Uint8Array {
    const Txn = proto.helium.blockchain_txn
    const addGateway = this.toProto()
    const txn = Txn.create({ addGateway })
    return Txn.encode(txn).finish()
  }

  static fromString(serializedTxnString: string): AddGatewayV1 {
    const buf = Buffer.from(serializedTxnString, 'base64')
    const { addGateway } = proto.helium.blockchain_txn.decode(buf)

    const owner = addGateway?.owner?.length ? toAddressable(addGateway?.owner) : undefined
    const gateway = addGateway?.gateway?.length ? toAddressable(addGateway?.gateway) : undefined
    const payer = addGateway?.payer?.length ? toAddressable(addGateway?.payer) : undefined

    const ownerSignature = addGateway?.ownerSignature?.length
      ? toUint8Array(addGateway?.ownerSignature)
      : undefined
    const gatewaySignature = addGateway?.gatewaySignature?.length
      ? toUint8Array(addGateway?.gatewaySignature)
      : undefined
    const payerSignature = addGateway?.payerSignature?.length
      ? toUint8Array(addGateway?.payerSignature)
      : undefined

    const fee = toNumber(addGateway?.fee)
    const stakingFee = toNumber(addGateway?.stakingFee)

    return new AddGatewayV1({
      owner,
      gateway,
      payer,
      fee,
      stakingFee,
      ownerSignature,
      gatewaySignature,
      payerSignature,
    })
  }

  async sign(keypairs: SignOptions): Promise<AddGatewayV1> {
    const AddGateway = proto.helium.blockchain_txn_add_gateway_v1
    const addGateway = this.toProto(true)
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

  private toProto(forSigning: boolean = false): proto.helium.blockchain_txn_add_gateway_v1 {
    const AddGateway = proto.helium.blockchain_txn_add_gateway_v1
    return AddGateway.create({
      owner: this.owner ? toUint8Array(this.owner.bin) : null,
      gateway: this.gateway ? toUint8Array(this.gateway.bin) : null,
      payer: this.payer ? toUint8Array(this.payer.bin) : null,
      ownerSignature: this.ownerSignature && !forSigning ? toUint8Array(this.ownerSignature) : null,
      gatewaySignature:
        this.gatewaySignature && !forSigning ? toUint8Array(this.gatewaySignature) : null,
      payerSignature: this.payerSignature && !forSigning ? toUint8Array(this.payerSignature) : null,
      stakingFee: this.stakingFee && this.stakingFee > 0 ? this.stakingFee : null,
      fee: this.fee && this.fee > 0 ? this.fee : null,
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
