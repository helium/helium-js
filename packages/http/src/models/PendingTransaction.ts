import camelcaseKeys from 'camelcase-keys'
import { Balance, CurrencyType } from '@helium/currency'
import DataModel from './DataModel'

export interface HTTPPendingTransactionObject {
  type: string
  txn: object | null
  status: string
  hash: string
  failed_reason: string | null
  created_at: string
  updated_at: string
}

export type PendingTransactionData = PendingTransaction

function processTxn(transaction: HTTPPendingTransactionObject): any {
  if (transaction.status === 'received') return null

  const rawTxn = transaction.txn as any
  const txn = camelcaseKeys(rawTxn)

  switch (transaction.type) {
    case 'payment_v1':
      return {
        ...txn,
        amount: new Balance(txn.amount, CurrencyType.default),
      }

    case 'payment_v2':
      return {
        ...txn,
        payments: txn.payments.map((p: any) => ({
          ...p,
          amount: new Balance(p.amount, CurrencyType.default),
        })),
        totalAmount: new Balance(
          txn.payments.reduce((sum: number, { amount }: any) => sum + amount, 0),
          CurrencyType.default,
        ),
      }

    default:
      return txn
  }
}

export default class PendingTransaction extends DataModel {
  public type: string

  public txn: any

  public status: string

  public hash: string

  public failedReason: string | null

  public createdAt: string

  public updatedAt: string

  constructor(transaction: HTTPPendingTransactionObject) {
    super()
    this.type = transaction.type
    this.txn = processTxn(transaction)
    this.status = transaction.status
    this.failedReason = transaction.failed_reason
    this.hash = transaction.hash
    this.createdAt = transaction.created_at
    this.updatedAt = transaction.updated_at
  }

  get data(): PendingTransactionData {
    return this
  }
}
