export default abstract class Transaction {
  abstract serialize (): Uint8Array
  abstract sign (opts: object): Promise<any>

  toString(): string {
    return Buffer.from(this.serialize()).toString('base64')
  }
}
