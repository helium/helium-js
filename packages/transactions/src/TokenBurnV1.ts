import proto from '@helium/proto'
import * as JSLong from 'long'
import Transaction from './Transaction'
import { EMPTY_SIGNATURE, toUint8Array } from './utils'
import { Addressable, Base64Memo, SignableKeypair } from './types'

interface TokenBurnOptions {
  payer: Addressable
  payee: Addressable
  amount: number
  nonce: number
  memo: Base64Memo
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
    this.fee = this.calculateFee()
  }

  serialize(): Uint8Array {
    const BlockchainTxn = proto.helium.blockchain_txn

    const tokenBurn = this.toProto()
    const txn = BlockchainTxn.create({ tokenBurn })
    return BlockchainTxn.encode(txn).finish()
  }

  async sign({ payer: payerKeypair }: SignOptions): Promise<TokenBurnV1> {
    const TokenBurnTxn = proto.helium.blockchain_txn_token_burn_v1
    const tokenBurn = this.toProto(true)
    const serialized = TokenBurnTxn.encode(tokenBurn).finish()
    this.signature = await payerKeypair.sign(serialized)
    return this
  }

  private toProto(forSigning: boolean = false): proto.helium.blockchain_txn_token_burn_v1 {
    const TokenBurnTxn = proto.helium.blockchain_txn_token_burn_v1
    const memoBuffer = Buffer.from(this.memo, 'base64')
    return TokenBurnTxn.create({
      payer: toUint8Array(this.payer.bin),
      payee: toUint8Array(this.payee.bin),
      amount: this.amount,
      nonce: this.nonce,
      signature: this.signature && !forSigning ? toUint8Array(this.signature) : null,
      fee: this.fee,
      memo: JSLong.fromBytes(Array.from(memoBuffer), true, true),
    })
  }

  calculateFee(): number {
    this.signature = EMPTY_SIGNATURE
    const payload = this.serialize()
    return Transaction.calculateFee(payload)
  }
}
