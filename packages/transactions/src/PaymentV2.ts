import proto from '@helium/proto'
import Transaction from './Transaction'
import { toUint8Array } from './utils'
import { Addressable, SignableKeypair } from './types'

interface PaymentOptions {
  payer?: Addressable
  payments?: Array<Payment>
  fee?: number
  nonce?: number
  signature?: Uint8Array | string
}

interface Payment {
  payee: Addressable
  amount: number
}

interface SignOptions {
  payer: SignableKeypair
}

export default class PaymentV2 extends Transaction {
  public payer?: Addressable
  public payments: Array<Payment>
  public fee?: number
  public nonce?: number
  public signature?: Uint8Array | string

  constructor(opts: PaymentOptions) {
    super()
    this.payer = opts.payer
    this.payments = opts.payments || []
    this.fee = opts.fee
    this.nonce = opts.nonce
    this.signature = opts.signature
  }

  serialize(): Uint8Array {
    const BlockchainTxn = proto.helium.blockchain_txn

    const paymentV2 = this.toProto()
    const txn = BlockchainTxn.create({ paymentV2 })
    return BlockchainTxn.encode(txn).finish()
  }

  async sign({ payer: payerKeypair }: SignOptions): Promise<PaymentV2> {
    const PaymentTxn = proto.helium.blockchain_txn_payment_v2
    const payment = this.toProto()
    const serialized = PaymentTxn.encode(payment).finish()
    const signature = await payerKeypair.sign(serialized)
    this.signature = signature
    return this
  }

  private toProto(): proto.helium.blockchain_txn_payment_v2 {
    const PaymentTxn = proto.helium.blockchain_txn_payment_v2
    const Payment = proto.helium.payment

    const payments = this.payments.map(({ payee, amount }) => Payment.create({
      payee: toUint8Array(payee.bin),
      amount,
    }))

    return PaymentTxn.create({
      payer: this.payer ? toUint8Array(this.payer.bin) : null,
      payments,
      fee: this.fee,
      nonce: this.nonce,
      signature: this.signature ? toUint8Array(this.signature) : null,
    })
  }
}
