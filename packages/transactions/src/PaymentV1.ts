import proto from '@helium/proto'
import Transaction from './Transaction'
import { toUint8Array } from './utils'

interface PaymentOptions {
  payer?: Addressable
  payee?: Addressable
  amount?: number
  fee?: number
  nonce?: number
  signature?: Uint8Array | string
}

interface SignableKeypair {
  sign(message: string | Uint8Array): Promise<Uint8Array>
}

interface Addressable {
  bin: Uint8Array
  b58: string
  publicKey: Uint8Array
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
  public signature?: Uint8Array | string

  constructor(opts: PaymentOptions) {
    super()
    this.payer = opts.payer
    this.payee = opts.payee
    this.amount = opts.amount
    this.fee = opts.fee
    this.nonce = opts.nonce
    this.signature = opts.signature
  }

  serialize(): Uint8Array {
    const Payment = proto.helium.blockchain_txn_payment_v1
    const Txn = proto.helium.blockchain_txn
    const payment = Payment.create({
      payer: this.payer ? toUint8Array(this.payer.bin) : null,
      payee: this.payee ? toUint8Array(this.payee.bin) : null,
      amount: this.amount,
      fee: this.fee,
      nonce: this.nonce,
      signature: toUint8Array(this.signature),
    })
    const txn = Txn.create({ payment })
    return Txn.encode(txn).finish()
  }

  async sign({ payer: payerKeypair }: SignOptions): Promise<PaymentV1> {
    const Payment = proto.helium.blockchain_txn_payment_v1
    const payment = Payment.create({
      payer: this.payer ? toUint8Array(this.payer.bin) : null,
      payee: this.payee ? toUint8Array(this.payee.bin) : null,
      amount: this.amount,
      fee: this.fee,
      nonce: this.nonce,
    })
    const serialized = Payment.encode(payment).finish()
    const signature = await payerKeypair.sign(serialized)
    this.signature = signature
    return this
  }
}
