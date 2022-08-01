import proto from '@helium/proto'
import Transaction from './Transaction'
import {
  toUint8Array,
  EMPTY_SIGNATURE,
  toAddressable,
  toNumber,
  toTokenType,
  toTicker,
} from './utils'
import { Addressable, SignableKeypair } from './types'

interface Options {
  account?: Addressable
  amount?: number
  fee?: number
  nonce?: number
  tokenType?: string
  signature?: Uint8Array
}

interface SignOptions {
  keypair: SignableKeypair
}

export default class TokenRedeemV1 extends Transaction {
  public account?: Addressable

  public amount?: number

  public fee?: number

  public nonce?: number

  public tokenType?: string

  public signature?: Uint8Array

  public type: string = 'token_redeem_v1'

  constructor(opts: Options) {
    super()
    this.account = opts.account
    this.amount = opts.amount
    this.nonce = opts.nonce
    this.tokenType = opts.tokenType
    if (opts.fee !== undefined) {
      this.fee = opts.fee
    } else {
      this.fee = 0
      this.fee = this.calculateFee()
    }
    this.signature = opts.signature
  }

  serialize(): Uint8Array {
    const Txn = proto.helium.blockchain_txn
    const tokenRedeem = this.toProto()
    const txn = Txn.create({ tokenRedeem })
    return Txn.encode(txn).finish()
  }

  message(): Uint8Array {
    const TokenRedeem = proto.helium.blockchain_txn_token_redeem_v1
    const tokenRedeem = this.toProto(true)
    return TokenRedeem.encode(tokenRedeem).finish()
  }

  async sign({ keypair }: SignOptions): Promise<TokenRedeemV1> {
    const serialized = this.message()
    this.signature = await keypair.sign(serialized)
    return this
  }

  private toProto(forSigning: boolean = false): proto.helium.blockchain_txn_token_redeem_v1 {
    const TokenRedeem = proto.helium.blockchain_txn_token_redeem_v1
    return TokenRedeem.create({
      account: this.account ? toUint8Array(this.account.bin) : null,
      amount: this.amount,
      fee: this.fee && this.fee > 0 ? this.fee : null,
      nonce: this.nonce,
      tokenType: toTokenType({ ticker: this.tokenType }),
      signature: this.signature && !forSigning ? toUint8Array(this.signature) : null,
    })
  }

  static fromString(serializedTxnString: string): TokenRedeemV1 {
    const buf = Buffer.from(serializedTxnString, 'base64')
    const { tokenRedeem } = proto.helium.blockchain_txn.decode(buf)

    const account = toAddressable(tokenRedeem?.account)
    const amount = toNumber(tokenRedeem?.amount) || 0
    const tokenType = toTicker(toNumber(tokenRedeem?.tokenType))
    const fee = toNumber(tokenRedeem?.fee)
    const nonce = toNumber(tokenRedeem?.nonce)
    const signature = tokenRedeem?.signature?.length
      ? toUint8Array(tokenRedeem?.signature)
      : undefined

    return new TokenRedeemV1({
      account,
      amount,
      tokenType,
      fee,
      nonce,
      signature,
    })
  }

  calculateFee(): number {
    this.signature = EMPTY_SIGNATURE
    const payload = this.serialize()
    return Transaction.calculateFee(payload)
  }
}
