import protobuf from 'protobufjs'
import path from 'path'
import Transaction from './Transaction'

interface PaymentOptions {
  payer?: String
  payee?: String
  amount?: Number
  fee?: Number
  nonce?: Number
  signature?: String
}

interface Keypair {
  sign(message: string | Uint8Array): Promise<string>
}

interface SignOptions {
  payer: Keypair
}

export default class Payment extends Transaction {
  public payer?: String
  public payee?: String
  public amount?: Number
  public fee?: Number
  public nonce?: Number
  public signature?: String

  constructor(opts: PaymentOptions) {
    super()
    this.payer = opts.payer
    this.payee = opts.payee
    this.amount = opts.amount
    this.fee = opts.fee
    this.nonce = opts.nonce
    this.signature = opts.signature
  }

  serialize(): Buffer {
    const Proto = Payment.loadProto()
    const message = Proto.create({
      payer: this.payer,
      payee: this.payee,
      amount: this.amount,
      fee: this.fee,
      nonce: this.nonce,
      signature: this.signature,
    })
    return Buffer.from(Proto.encode(message).finish())
  }

  async sign({ payer: payerKeypair }: SignOptions): Promise<Payment> {
    const serialized = this.serialize()
    const signature = await payerKeypair.sign(serialized)
    this.signature = signature
    return this
  }

  private static loadProto(): protobuf.Type {
    const root = protobuf.loadSync(
      path.resolve(path.join(__dirname, '/proto/blockchain_txn.proto')),
    )
    return root.lookupType('txn_payment_v1')
  }
}
