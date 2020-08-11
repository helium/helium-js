import proto from '@helium/proto'
import Transaction from './Transaction'
import { EMPTY_SIGNATURE, toUint8Array } from './utils'
import { Addressable, SignableKeypair } from './types'

interface TokenBurnOptions {
  payer: Addressable
  payee: Addressable
  amount: number
  nonce: number
  memo: number
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
  public memo: number

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
    return TokenBurnTxn.create({
      payer: toUint8Array(this.payer.bin),
      payee: toUint8Array(this.payee.bin),
      amount: this.amount,
      nonce: this.nonce,
      signature: this.signature && !forSigning ? toUint8Array(this.signature) : null,
      fee: this.fee,
      memo: this.memo,
    })
  }

  calculateFee(): number {
    this.signature = EMPTY_SIGNATURE
    const payload = this.serialize()
    return Transaction.calculateFee(payload)
  }
}
