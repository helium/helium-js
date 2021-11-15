import proto from '@helium/proto'
import Transaction from './Transaction'
import { toUint8Array, EMPTY_SIGNATURE } from './utils'
import { Addressable, SignableKeypair } from './types'

interface PaymentOptions {
  payer?: Addressable
  payee?: Addressable
  amount?: number
  fee?: number
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

  public type: string = 'payment_v1'

  constructor(opts: PaymentOptions) {
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
    const payment = this.toProto()
    const txn = Txn.create({ payment })
    return Txn.encode(txn).finish()
  }

  async sign({ payer: payerKeypair }: SignOptions): Promise<PaymentV1> {
    const Payment = proto.helium.blockchain_txn_payment_v1
    const payment = this.toProto(true)
    const serialized = Payment.encode(payment).finish()
    const signature = await payerKeypair.sign(serialized)
    this.signature = signature
    return this
  }

  private toProto(
    forSigning: boolean = false,
  ): proto.helium.blockchain_txn_payment_v1 {
    const Payment = proto.helium.blockchain_txn_payment_v1
    return Payment.create({
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
