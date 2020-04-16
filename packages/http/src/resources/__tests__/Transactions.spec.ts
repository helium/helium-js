import nock from 'nock'
import Client from '../../Client'

describe('submit', () => {
  it('posts to the pending transactions endpoint', async () => {
    nock('https://api.helium.io')
      .post('/v1/pending_transactions', { txn: 'my txn' })
      .reply(200, {
        data: {
          hash: 'txn hash',
        },
      })

    const client = new Client()

    const pendingTxn = await client.transactions.submit('my txn')
    expect(pendingTxn.hash).toBe('txn hash')
  })
})
