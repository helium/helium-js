/* eslint-disable consistent-return */
import proto from '@helium/proto'
import * as JSLong from 'long'
import Transaction from './Transaction'
import {
  EMPTY_SIGNATURE, toAddressable, toNumber, toUint8Array, toString,
} from './utils'
import { Addressable, Base64Memo, SignableKeypair } from './types'

interface TokenBurnOptions {
  payer: Addressable
  payee: Addressable
  amount: number
  nonce: number
  memo: Base64Memo
  fee?: number
  signature?: Uint8Array
}

interface SignOptions {
  payer: SignableKeypair
}

export default class TokenBurnV1 extends Transaction {
  public payer: Addressable

  public payee: Addressable

  public amount: number

  public nonce: number

  public signature?: Uint8Array

  public fee?: number

  public memo: Base64Memo

  public type: string = 'token_burn_v1'

  constructor(opts: TokenBurnOptions) {
    super()
    this.payer = opts.payer
    this.payee = opts.payee
    this.amount = opts.amount
    this.nonce = opts.nonce
    this.memo = opts.memo
    this.fee = opts.fee === undefined ? this.calculateFee() : opts.fee
    this.signature = opts.signature
  }

  serialize(): Uint8Array {
    const BlockchainTxn = proto.helium.blockchain_txn
    const tokenBurn = this.toProto()
    const txn = BlockchainTxn.create({ tokenBurn })
    return BlockchainTxn.encode(txn).finish()
  }

  message(): Uint8Array {
    const TokenBurnTxn = proto.helium.blockchain_txn_token_burn_v1
    const tokenBurn = this.toProto(true)
    return TokenBurnTxn.encode(tokenBurn).finish()
  }

  async sign({ payer: payerKeypair }: SignOptions): Promise<TokenBurnV1> {
    const serialized = this.message()
    this.signature = await payerKeypair.sign(serialized)
    return this
  }

  private toProto(forSigning: boolean = false): proto.helium.blockchain_txn_token_burn_v1 {
    const TokenBurnTxn = proto.helium.blockchain_txn_token_burn_v1
    const memoBuffer = Buffer.from(this.memo, 'base64')
    const memoLong = JSLong.fromBytes(Array.from(memoBuffer), true, true)
    return TokenBurnTxn.create({
      payer: toUint8Array(this.payer.bin),
      payee: toUint8Array(this.payee.bin),
      amount: this.amount,
      nonce: this.nonce,
      signature: this.signature && !forSigning ? toUint8Array(this.signature) : null,
      fee: this.fee,
      memo: !memoLong.isZero() ? memoLong : undefined,
    })
  }

  static fromString(serializedTxnString: string): TokenBurnV1 | undefined {
    const buf = Buffer.from(serializedTxnString, 'base64')
    const { tokenBurn } = proto.helium.blockchain_txn.decode(buf)

    const payer = toAddressable(tokenBurn?.payer)
    const payee = toAddressable(tokenBurn?.payee)
    const amount = toNumber(tokenBurn?.amount) || 0
    const nonce = toNumber(tokenBurn?.nonce)
    const memo = toString(tokenBurn?.memo) || ''
    const fee = toNumber(tokenBurn?.fee)

    const signature = tokenBurn?.signature?.length
      ? toUint8Array(tokenBurn?.signature)
      : undefined

    if (!payee || !payer || !amount || nonce === undefined) return

    return new TokenBurnV1({
      payer, payee, amount, nonce, memo, fee, signature,
    })
  }

  calculateFee(): number {
    this.signature = EMPTY_SIGNATURE
    const payload = this.serialize()
    return Transaction.calculateFee(payload)
  }
}
