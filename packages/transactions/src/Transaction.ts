/* eslint-disable class-methods-use-this */
import proto from '@helium/proto'

interface ChainVars {
  txnFeeMultiplier?: number
  dcPayloadSize?: number
  stakingFeeTxnAssertLocationV1?: number
  stakingFeeTxnAddGatewayV1?: number
}

export default abstract class Transaction {
  static txnFeeMultiplier: number = 0

  static dcPayloadSize: number = 24

  static stakingFeeTxnAssertLocationV1: number = 1

  static stakingFeeTxnAddGatewayV1: number = 1

  abstract serialize(): Uint8Array

  message(): Uint8Array {
    throw new Error('unimplemented')
  }

  abstract sign(opts: object): Promise<any>

  static config(vars: ChainVars) {
    if (vars.txnFeeMultiplier) {
      Transaction.txnFeeMultiplier = vars.txnFeeMultiplier
    }
    if (vars.dcPayloadSize) {
      Transaction.dcPayloadSize = vars.dcPayloadSize
    }
    if (vars.stakingFeeTxnAssertLocationV1) {
      Transaction.stakingFeeTxnAssertLocationV1 = vars.stakingFeeTxnAssertLocationV1
    }
    if (vars.stakingFeeTxnAddGatewayV1) {
      Transaction.stakingFeeTxnAddGatewayV1 = vars.stakingFeeTxnAddGatewayV1
    }
  }

  toString(): string {
    return Buffer.from(this.serialize()).toString('base64')
  }

  static stringType(serializedTxnString: string): string {
    const buf = Buffer.from(serializedTxnString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    const obj = proto.helium.blockchain_txn.toObject(decoded)
    return Object.keys(obj)[0]
  }

  static calculateFee(payload: Uint8Array): number {
    return (
      Math.ceil(payload.byteLength / Transaction.dcPayloadSize)
      * Transaction.txnFeeMultiplier
    )
  }
}
