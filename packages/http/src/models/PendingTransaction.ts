export interface HTTPPendingTransactionObject {
  hash: string
}

export default class PendingTransaction {
  public hash: string

  constructor(transaction: HTTPPendingTransactionObject) {
    this.hash = transaction.hash
  }
}
