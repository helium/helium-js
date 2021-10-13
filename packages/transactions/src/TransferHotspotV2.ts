import proto from '@helium/proto'
import Transaction from './Transaction'
import {
  EMPTY_SIGNATURE,
  toUint8Array,
  toAddressable,
  toNumber,
} from './utils'
import { Addressable, SignableKeypair } from './types'

interface TransferHotspotOptionsV2 {
  gateway?: Addressable
  owner?: Addressable
  ownerSignature?: Uint8Array
  newOwner?: Addressable
  fee?: number
  nonce?: number // gateway nonce
}

interface SignOptions {
  owner: SignableKeypair
}

export default class TransferHotspotV2 extends Transaction {
  public gateway?: Addressable

  public owner?: Addressable

  public ownerSignature?: Uint8Array

  public newOwner?: Addressable

  public fee?: number

  public nonce?: number // gateway nonce

  public type: string = 'transfer_hotspot_v2'

  constructor(opts: TransferHotspotOptionsV2) {
    super()
    this.gateway = opts.gateway
    this.owner = opts.owner
    this.newOwner = opts.newOwner
    this.nonce = opts.nonce
    if (opts.fee !== undefined) {
      this.fee = opts.fee
    } else {
      this.fee = 0
      this.fee = this.calculateFee()
    }
    this.ownerSignature = opts.ownerSignature
  }

  serialize(): Uint8Array {
    const BlockchainTxn = proto.helium.blockchain_txn
    const transferHotspotV2 = this.toProto()
    const txn = BlockchainTxn.create({ transferHotspotV2 })
    return BlockchainTxn.encode(txn).finish()
  }

  static fromString(serializedTxnString: string): TransferHotspotV2 {
    const buf = Buffer.from(serializedTxnString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    const gateway = toAddressable(decoded.transferHotspotV2?.gateway)
    const owner = toAddressable(decoded.transferHotspotV2?.owner)
    const ownerSignature = toUint8Array(decoded.transferHotspotV2?.ownerSignature)
    const newOwner = toAddressable(decoded.transferHotspotV2?.newOwner)
    const fee = toNumber(decoded.transferHotspotV2?.fee)
    const nonce = toNumber(decoded.transferHotspotV2?.nonce)

    return new TransferHotspotV2({
      gateway,
      owner,
      ownerSignature,
      newOwner,
      fee,
      nonce,
    })
  }

  async sign({ owner: ownerKeypair }: SignOptions): Promise<TransferHotspotV2> {
    const TransferHotspotTxn = proto.helium.blockchain_txn_transfer_hotspot_v2
    const transferHotspot = this.toProto(true)
    const serialized = TransferHotspotTxn.encode(transferHotspot).finish()
    this.ownerSignature = await ownerKeypair.sign(serialized)
    return this
  }

  private toProto(forSigning: boolean = false): proto.helium.blockchain_txn_transfer_hotspot_v2 {
    const TransferHotspotTxn = proto.helium.blockchain_txn_transfer_hotspot_v2
    return TransferHotspotTxn.create({
      gateway: this.gateway ? toUint8Array(this.gateway.bin) : null,
      owner: this.owner ? toUint8Array(this.owner.bin) : null,
      ownerSignature: this.ownerSignature && !forSigning
        ? toUint8Array(this.ownerSignature) : null,
      newOwner: this.newOwner ? toUint8Array(this.newOwner.bin) : null,
      fee: this.fee ? this.fee : null,
      nonce: this.nonce,
    })
  }

  calculateFee(): number {
    this.ownerSignature = EMPTY_SIGNATURE
    const payload = this.serialize()
    return Transaction.calculateFee(payload)
  }
}
