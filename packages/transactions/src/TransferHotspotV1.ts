import proto from '@helium/proto'
import Transaction from './Transaction'
import { EMPTY_SIGNATURE, toUint8Array } from './utils'
import { Addressable, SignableKeypair } from './types'

interface TransferHotspotOptions {
  gateway: Addressable
  seller: Addressable
  buyer: Addressable
  sellerSignature?: Uint8Array
  buyerSignature?: Uint8Array
  buyerNonce: number
  amountToSeller: number
}

interface SignOptions {
  seller?: SignableKeypair
  buyer?: SignableKeypair
}

export default class TransferHotspotV1 extends Transaction {
  public gateway: Addressable

  public seller: Addressable

  public buyer: Addressable

  public sellerSignature?: Uint8Array

  public buyerSignature?: Uint8Array

  public buyerNonce: number

  public amountToSeller?: number

  public fee?: number

  constructor(opts: TransferHotspotOptions) {
    super()
    this.gateway = opts.gateway
    this.seller = opts.seller
    this.buyer = opts.buyer
    this.sellerSignature = opts.sellerSignature
    this.buyerSignature = opts.buyerSignature
    this.buyerNonce = opts.buyerNonce
    this.amountToSeller = opts.amountToSeller
    this.fee = this.calculateFee()
  }

  serialize(): Uint8Array {
    const BlockchainTxn = proto.helium.blockchain_txn

    const transferHotspot = this.toProto()
    const txn = BlockchainTxn.create({ transferHotspot })
    return BlockchainTxn.encode(txn).finish()
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
      gateway: toUint8Array(this.gateway.bin),
      seller: toUint8Array(this.seller.bin),
      buyer: toUint8Array(this.buyer.bin),
      sellerSignature: this.sellerSignature && !forSigning
        ? toUint8Array(this.sellerSignature) : null,
      buyerSignature: this.buyerSignature && !forSigning
        ? toUint8Array(this.buyerSignature) : null,
      buyerNonce: this.buyerNonce,
      amountToSeller: this.amountToSeller,
      fee: this.fee,
    })
  }

  calculateFee(): number {
    this.buyerSignature = EMPTY_SIGNATURE
    this.sellerSignature = EMPTY_SIGNATURE
    const payload = this.serialize()
    return Transaction.calculateFee(payload)
  }
}
