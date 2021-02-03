import proto from '@helium/proto'
import Transaction from './Transaction'
import {
  EMPTY_SIGNATURE,
  toUint8Array,
  toAddressable,
  toNumber,
} from './utils'
import { Addressable, SignableKeypair } from './types'

interface TransferHotspotOptions {
  gateway?: Addressable
  seller?: Addressable
  buyer?: Addressable
  sellerSignature?: Uint8Array
  buyerSignature?: Uint8Array
  buyerNonce?: number
  amountToSeller?: number
  fee?: number
}

interface SignOptions {
  seller?: SignableKeypair
  buyer?: SignableKeypair
}

export default class TransferHotspotV1 extends Transaction {
  public gateway?: Addressable

  public seller?: Addressable

  public buyer?: Addressable

  public sellerSignature?: Uint8Array

  public buyerSignature?: Uint8Array

  public buyerNonce?: number

  public amountToSeller?: number

  public fee?: number

  public type: string = 'transfer_hotspot_v1'

  constructor(opts: TransferHotspotOptions) {
    super()
    this.gateway = opts.gateway
    this.seller = opts.seller
    this.buyer = opts.buyer
    this.buyerNonce = opts.buyerNonce
    this.amountToSeller = opts.amountToSeller
    if (opts.fee !== undefined) {
      this.fee = opts.fee
    } else {
      this.fee = 0
      this.fee = this.calculateFee()
    }
    this.sellerSignature = opts.sellerSignature
    this.buyerSignature = opts.buyerSignature
  }

  serialize(): Uint8Array {
    const BlockchainTxn = proto.helium.blockchain_txn
    const transferHotspot = this.toProto()
    const txn = BlockchainTxn.create({ transferHotspot })
    return BlockchainTxn.encode(txn).finish()
  }

  static fromString(serializedTxnString: string): TransferHotspotV1 {
    const buf = Buffer.from(serializedTxnString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    const gateway = toAddressable(decoded.transferHotspot?.gateway)
    const seller = toAddressable(decoded.transferHotspot?.seller)
    const buyer = toAddressable(decoded.transferHotspot?.buyer)
    const sellerSignature = toUint8Array(decoded.transferHotspot?.sellerSignature)
    const buyerSignature = toUint8Array(decoded.transferHotspot?.buyerSignature)
    const buyerNonce = toNumber(decoded.transferHotspot?.buyerNonce)
    const amountToSeller = toNumber(decoded.transferHotspot?.amountToSeller)
    const fee = toNumber(decoded.transferHotspot?.fee)

    return new TransferHotspotV1({
      gateway,
      seller,
      buyer,
      sellerSignature,
      buyerSignature,
      buyerNonce,
      amountToSeller,
      fee,
    })
  }

  async sign(keypairs: SignOptions): Promise<TransferHotspotV1> {
    const TransferHotspotTxn = proto.helium.blockchain_txn_transfer_hotspot_v1
    const transferHotspot = this.toProto(true)
    const serialized = TransferHotspotTxn.encode(transferHotspot).finish()

    if (keypairs.seller) {
      this.sellerSignature = await keypairs.seller.sign(serialized)
    }

    if (keypairs.buyer) {
      this.buyerSignature = await keypairs.buyer.sign(serialized)
    }

    return this
  }

  private toProto(forSigning: boolean = false): proto.helium.blockchain_txn_transfer_hotspot_v1 {
    const TransferHotspotTxn = proto.helium.blockchain_txn_transfer_hotspot_v1
    return TransferHotspotTxn.create({
      gateway: this.gateway ? toUint8Array(this.gateway.bin) : null,
      seller: this.seller ? toUint8Array(this.seller.bin) : null,
      buyer: this.buyer ? toUint8Array(this.buyer.bin) : null,
      sellerSignature: this.sellerSignature && !forSigning
        ? toUint8Array(this.sellerSignature) : null,
      buyerSignature: this.buyerSignature && !forSigning
        ? toUint8Array(this.buyerSignature) : null,
      buyerNonce: this.buyerNonce,
      amountToSeller: this.amountToSeller ? this.amountToSeller : null,
      fee: this.fee ? this.fee : null,
    })
  }

  calculateFee(): number {
    this.buyerSignature = EMPTY_SIGNATURE
    this.sellerSignature = EMPTY_SIGNATURE
    const payload = this.serialize()
    return Transaction.calculateFee(payload)
  }
}
