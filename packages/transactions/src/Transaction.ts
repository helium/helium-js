export default abstract class Transaction {
  abstract serialize (): Buffer

  toString(): String {
    return this.serialize().toString('base64')
  }
}
