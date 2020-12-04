import proto from '@helium/proto'
import Transaction from './Transaction'
import { toUint8Array, EMPTY_SIGNATURE, toAddressable, toNumber } from './utils'
import { Addressable, SignableKeypair } from './types'

interface PaymentOptions {
  payer?: Addressable
  payments?: Array<Payment>
  nonce?: number
  fee?: number
  signature?: Uint8Array
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
  public signature?: Uint8Array

  constructor(opts: PaymentOptions) {
    super()
    this.payer = opts.payer
    this.payments = opts.payments || []
    this.nonce = opts.nonce
    if (opts.fee) {
      this.fee = opts.fee
    } else {
      this.fee = 0
      this.fee = this.calculateFee()
    }
    this.signature = opts.signature
  }

  serialize(): Uint8Array {
    const BlockchainTxn = proto.helium.blockchain_txn

    const paymentV2 = this.toProto()
    const txn = BlockchainTxn.create({ paymentV2 })
    return BlockchainTxn.encode(txn).finish()
  }

  static fromString(serializedTxnString: string) {
    const buf = Buffer.from(serializedTxnString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    const payer = toAddressable(decoded.paymentV2?.payer)
    const payments = (decoded.paymentV2?.payments || []).map((p) => ({
      payee: toAddressable(p!.payee) as Addressable,
      amount: toNumber(p!.amount) as number,
    }))
    const fee = toNumber(decoded.paymentV2?.fee)
    const nonce = toNumber(decoded.paymentV2?.nonce)
    const signature = toUint8Array(decoded.paymentV2?.signature)

    return new PaymentV2({
      payer,
      payments,
      fee,
      nonce,
      signature,
    })
  }

  async sign({ payer: payerKeypair }: SignOptions): Promise<PaymentV2> {
    const PaymentTxn = proto.helium.blockchain_txn_payment_v2
    const payment = this.toProto(true)
    const serialized = PaymentTxn.encode(payment).finish()
    const signature = await payerKeypair.sign(serialized)
    this.signature = signature
    return this
  }

  private toProto(
    forSigning: boolean = false,
  ): proto.helium.blockchain_txn_payment_v2 {
    const PaymentTxn = proto.helium.blockchain_txn_payment_v2
    const Payment = proto.helium.payment

    const payments = this.payments.map(({ payee, amount }) =>
      Payment.create({
        payee: toUint8Array(payee.bin),
        amount,
      }),
    )

    return PaymentTxn.create({
      payer: this.payer ? toUint8Array(this.payer.bin) : null,
      payments,
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
