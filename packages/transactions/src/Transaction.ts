export default abstract class Transaction {
  abstract serialize (): Uint8Array

  toString(): string {
    return Buffer.from(this.serialize()).toString('base64')
  }
}
