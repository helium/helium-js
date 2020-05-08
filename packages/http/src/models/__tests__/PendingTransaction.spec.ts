import PendingTransaction from '../PendingTransaction'

const receivedPendingTxn = {
  created_at: '2020-05-08T00:41:37.277776Z',
  failed_reason: null,
  hash: 'fake-pending-txn-hash',
  status: 'received',
  txn: null,
  type: 'payment_v1',
  updated_at: '2020-05-08T00:41:37.277776Z',
}

describe('when status is received', () => {
  it('does not have a txn field', () => {
    const pendingTxn = new PendingTransaction(receivedPendingTxn)
    expect(pendingTxn.status).toBe('received')
    expect(pendingTxn.type).toBe('payment_v1')
    expect(pendingTxn.txn).toBe(null)
  })
})
