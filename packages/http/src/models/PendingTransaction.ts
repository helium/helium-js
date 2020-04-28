import camelcaseKeys from 'camelcase-keys'
import Balance from './Balance'
import CurrencyType from './CurrencyType'

export interface HTTPPendingTransactionObject {
  type: string
  txn: object
  status: string
  hash: string
  failed_reason: string
  created_at: string
  updated_at: string
}

function processTxn(type: string, rawTxn: any): any {
  const txn = camelcaseKeys(rawTxn)

  switch (type) {
    case 'payment_v1':
      return {
        ...txn,
        amount: new Balance(txn.amount, CurrencyType.default)
      }

    case 'payment_v2':
      return {
        ...txn,
        payments: txn.payments.map((p: any) => ({
          ...p,
          amount: new Balance(p.amount, CurrencyType.default)
        }))
      }
  
    default:
      return txn
  }
}

export default class PendingTransaction {
  public type: string
  public txn: any
  public status: string
  public hash: string
  public failedReason: string
  public createdAt: string
  public updatedAt: string

  constructor(transaction: HTTPPendingTransactionObject) {
    this.type = transaction.type
    this.txn = processTxn(transaction.type, transaction.txn)
    this.status = transaction.status
    this.failedReason = transaction.failed_reason
    this.hash = transaction.hash
    this.createdAt = transaction.created_at
    this.updatedAt = transaction.updated_at
  }
}
