import nock from 'nock'
import Client from '../../Client'

describe('list from account payment_v1', () => {
  nock('https://api.helium.io')
    .get('/v1/accounts/fake-address/pending_transactions')
    .reply(200, {
      data: [
        {
          updated_at: '2020-04-27T23:30:35.730237Z',
          type: 'payment_v1',
          txn: {
            signature: 'fake-signature',
            payer: 'fake-address',
            payee: 'fake-address-2',
            nonce: 1,
            fee: 0,
            amount: 1,
          },
          status: 'pending',
          hash: 'fake-hash',
          failed_reason: '',
          created_at: '2020-04-27T23:30:35.365656Z',
        },
      ],
    })

  it('lists all pending transactions for an account', async () => {
    const client = new Client()
    const list = await client.account('fake-address').pendingTransactions.list()
    const [pendingTxn] = await list.take(1)
    expect(pendingTxn.type).toBe('payment_v1')
    expect(pendingTxn.txn.amount.integerBalance).toBe(1)
  })
})

describe('list from account payment_v2', () => {
  nock('https://api.helium.io')
    .get('/v1/accounts/fake-address/pending_transactions')
    .reply(200, {
      data: [
        {
          updated_at: '2020-04-27T23:30:35.730237Z',
          type: 'payment_v2',
          txn: {
            signature: 'fake-signature',
            payer: 'fake-address',
            payments: [
              {
                payee: 'fake-address-2',
                amount: 1,
              },
            ],
            nonce: 1,
            fee: 0,
          },
          status: 'pending',
          hash: 'fake-hash',
          failed_reason: '',
          created_at: '2020-04-27T23:30:35.365656Z',
        },
      ],
    })

  it('lists all pending transactions for an account', async () => {
    const client = new Client()
    const list = await client.account('fake-address').pendingTransactions.list()
    const [pendingTxn] = await list.take(1)
    expect(pendingTxn.type).toBe('payment_v2')
    expect(pendingTxn.txn.payments[0].amount.integerBalance).toBe(1)
    expect(pendingTxn.txn.totalAmount.integerBalance).toBe(1)
  })
})

describe('list without context', () => {
  it('throws an error', async () => {
    const client = new Client()

    const makeList = async () => {
      await client.pendingTransactions.list()
    }
    await expect(makeList()).rejects.toThrow()
    
  });
});

describe('get pending transaction', () => {
  nock('https://api.helium.io')
    .get('/v1/pending_transactions/fake-hash')
    .reply(200, {
      data: {
        updated_at: '2020-04-27T23:30:35.730237Z',
        type: 'payment_v1',
        txn: {
          signature: 'fake-signature',
          payer: 'fake-address',
          payee: 'fake-address-2',
          nonce: 1,
          fee: 0,
          amount: 1,
        },
        status: 'pending',
        hash: 'fake-hash',
        failed_reason: '',
        created_at: '2020-04-27T23:30:35.365656Z',
      },
    })

  it('gets a single pending transaction by hash', async () => {
    const client = new Client()
    const pendingTxn = await client.pendingTransactions.get('fake-hash')
    expect(pendingTxn.type).toBe('payment_v1')
    expect(pendingTxn.txn.amount.integerBalance).toBe(1)
  })
})
