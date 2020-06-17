export default abstract class Transaction {
  static txnFeeMultiplier: number = 0
  static dcPayloadSize: number = 24

  abstract serialize (): Uint8Array
  abstract sign (opts: object): Promise<any>

  toString(): string {
    return Buffer.from(this.serialize()).toString('base64')
  }
}
