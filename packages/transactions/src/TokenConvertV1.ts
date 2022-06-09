import proto from '@helium/proto'
import Transaction from './Transaction'
import { toUint8Array, EMPTY_SIGNATURE } from './utils'
import { Addressable, SignableKeypair } from './types'

interface Options {
  account?: Addressable
  amount?: number
  fee?: number
  nonce?: number
  tokenType?: number
}

interface SignOptions {
  keypair: SignableKeypair
}

export default class TokenConvertV1 extends Transaction {
  public account?: Addressable

  public amount?: number

  public fee?: number

  public nonce?: number

  public tokenType?: number

  public signature?: Uint8Array

  public type: string = 'token_convert_v1'

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
  }

  serialize(): Uint8Array {
    const Txn = proto.helium.blockchain_txn
    const tokenConvert = this.toProto()
    const txn = Txn.create({ tokenConvert })
    return Txn.encode(txn).finish()
  }

  async sign({ keypair }: SignOptions): Promise<TokenConvertV1> {
    const TokenConvert = proto.helium.blockchain_txn_token_convert_v1
    const tokenConvert = this.toProto(true)
    const serialized = TokenConvert.encode(tokenConvert).finish()
    this.signature = await keypair.sign(serialized)
    return this
  }

  private toProto(
    forSigning: boolean = false,
  ): proto.helium.blockchain_txn_token_convert_v1 {
    const TokenConvert = proto.helium.blockchain_txn_token_convert_v1
    return TokenConvert.create({
      account: this.account ? toUint8Array(this.account.bin) : null,
      amount: this.amount,
      fee: this.fee && this.fee > 0 ? this.fee : null,
      nonce: this.nonce,
      tokenType: this.tokenType,
      signature:
        this.signature && !forSigning ? toUint8Array(this.signature) : null,
    })
  }

  calculateFee(): number {
    this.signature = EMPTY_SIGNATURE
    const payload = this.serialize()
    return Transaction.calculateFee(payload)
  }
}
