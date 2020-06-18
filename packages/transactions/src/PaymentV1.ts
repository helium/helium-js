import proto from '@helium/proto'
import Transaction from './Transaction'
import { toUint8Array, EMPTY_SIGNATURE } from './utils'
import { Addressable, SignableKeypair } from './types'

interface PaymentOptions {
  payer?: Addressable
  payee?: Addressable
  amount?: number
  nonce?: number
}

interface SignOptions {
  payer: SignableKeypair
}

export default class PaymentV1 extends Transaction {
  public payer?: Addressable
  public payee?: Addressable
  public amount?: number
  public fee?: number
  public nonce?: number
  public signature?: Uint8Array

  constructor(opts: PaymentOptions) {
    super()
    this.payer = opts.payer
    this.payee = opts.payee
    this.amount = opts.amount
    this.nonce = opts.nonce
    this.fee = this.calculateFee()
  }

  serialize(): Uint8Array {
    const Txn = proto.helium.blockchain_txn
    const payment = this.toProto()
    const txn = Txn.create({ payment })
    return Txn.encode(txn).finish()
  }

  async sign({ payer: payerKeypair }: SignOptions): Promise<PaymentV1> {
    const Payment = proto.helium.blockchain_txn_payment_v1
    const payment = this.toProto()
    const serialized = Payment.encode(payment).finish()
    const signature = await payerKeypair.sign(serialized)
    this.signature = signature
    return this
  }

  private toProto(): proto.helium.blockchain_txn_payment_v1 {
    const Payment = proto.helium.blockchain_txn_payment_v1
    return Payment.create({
      payer: this.payer ? toUint8Array(this.payer.bin) : null,
      payee: this.payee ? toUint8Array(this.payee.bin) : null,
      amount: this.amount,
      fee: this.fee,
      nonce: this.nonce,
      signature: this.signature ? toUint8Array(this.signature) : null,
    })
  }
  
  calculateFee(): number {
    this.signature = EMPTY_SIGNATURE
    const payload = this.serialize()
    return Transaction.calculateFee(payload)
  }
}
