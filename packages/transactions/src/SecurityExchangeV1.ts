import proto from '@helium/proto'
import Transaction from './Transaction'
import { toUint8Array, EMPTY_SIGNATURE } from './utils'
import { Addressable, SignableKeypair } from './types'

interface Options {
  payer?: Addressable
  payee?: Addressable
  amount?: number
  fee?: number
  nonce?: number
}

interface SignOptions {
  payer: SignableKeypair
}

export default class SecurityExchangeV1 extends Transaction {
  public payer?: Addressable

  public payee?: Addressable

  public amount?: number

  public fee?: number

  public nonce?: number

  public signature?: Uint8Array

  public type: string = 'security_exchange_v1'

  constructor(opts: Options) {
    super()
    this.payer = opts.payer
    this.payee = opts.payee
    this.amount = opts.amount
    this.nonce = opts.nonce
    if (opts.fee !== undefined) {
      this.fee = opts.fee
    } else {
      this.fee = 0
      this.fee = this.calculateFee()
    }
  }

  serialize(): Uint8Array {
    const Txn = proto.helium.blockchain_txn
    const securityExchange = this.toProto()
    const txn = Txn.create({ securityExchange })
    return Txn.encode(txn).finish()
  }

  async sign({ payer: payerKeypair }: SignOptions): Promise<SecurityExchangeV1> {
    const SecurityExchange = proto.helium.blockchain_txn_security_exchange_v1
    const securityExchange = this.toProto(true)
    const serialized = SecurityExchange.encode(securityExchange).finish()
    const signature = await payerKeypair.sign(serialized)
    this.signature = signature
    return this
  }

  private toProto(
    forSigning: boolean = false,
  ): proto.helium.blockchain_txn_security_exchange_v1 {
    const SecurityExchange = proto.helium.blockchain_txn_security_exchange_v1
    return SecurityExchange.create({
      payer: this.payer ? toUint8Array(this.payer.bin) : null,
      payee: this.payee ? toUint8Array(this.payee.bin) : null,
      amount: this.amount,
      fee: this.fee && this.fee > 0 ? this.fee : null,
      nonce: this.nonce,
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
