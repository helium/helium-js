import nock from 'nock'
import Client from '../../Client'
import type { PaymentV1 } from '../../models/Transaction'

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

describe('get', () => {
  nock('https://api.helium.io')
    .get('/v1/transactions/fake-hash-1')
    .reply(200, {
      data: {
        type: 'payment_v1',
        time: 1586629801,
        signature: 'fake-sig-1',
        payer: 'my-address',
        payee: 'some-other-address',
        nonce: 54,
        height: 12345,
        hash: 'fake-hash-1',
        fee: 0,
        amount: 10000,
      },
    })

  it('gets a transaction by hash', async () => {
    const client = new Client()
    const txn = (await client.transactions.get('fake-hash-1')) as PaymentV1
    expect(txn.amount.integerBalance).toBe(10000)
  })
})

describe('list from account', () => {
  nock('https://api.helium.io')
    .get('/v1/accounts/my-address/activity')
    .query({ filter_types: 'payment_v1' })
    .reply(200, {
      data: [
        {
          type: 'payment_v1',
          time: 1586629801,
          signature: 'fake-sig-1',
          payer: 'my-address',
          payee: 'some-other-address',
          nonce: 54,
          height: 12345,
          hash: 'fake-hash-1',
          fee: 0,
          amount: 10000,
        },
        {
          type: 'payment_v1',
          time: 1585784540,
          signature: 'fake-sig-2',
          payer: 'some-other-address',
          payee: 'my-address',
          nonce: 53,
          height: 12344,
          hash: 'fake-hash-2',
          fee: 0,
          amount: 20000,
        },
      ],
    })

  it('lists transaction activity for an account', async () => {
    const client = new Client()
    const list = await client
      .account('my-address')
      .activity.list({ filterTypes: ['payment_v1'] })
    const payments = (await list.take(2)) as PaymentV1[]
    expect(payments[0].amount.integerBalance).toBe(10000)
    expect(payments[1].amount.integerBalance).toBe(20000)
  })
})

describe('list from block by height', () => {
  nock('https://api.helium.io')
    .get('/v1/blocks/12345/transactions')
    .reply(200, {
      data: [
        {
          type: 'payment_v1',
          time: 1586629801,
          signature: 'fake-sig-1',
          payer: 'my-address',
          payee: 'some-other-address',
          nonce: 54,
          height: 12345,
          hash: 'fake-hash-1',
          fee: 0,
          amount: 10000,
        },
        {
          type: 'payment_v1',
          time: 1585784540,
          signature: 'fake-sig-2',
          payer: 'some-other-address',
          payee: 'my-address',
          nonce: 53,
          height: 12344,
          hash: 'fake-hash-2',
          fee: 0,
          amount: 20000,
        },
      ],
    })

  it('lists transactions', async () => {
    const client = new Client()
    const list = await client.block(12345).transactions.list()
    const payments = (await list.take(2)) as PaymentV1[]
    expect(payments[0].amount.integerBalance).toBe(10000)
    expect(payments[1].amount.integerBalance).toBe(20000)
  })
})

describe('list from block by hash', () => {
  nock('https://api.helium.io')
    .get('/v1/blocks/hash/fake-hash/transactions')
    .reply(200, {
      data: [
        {
          type: 'payment_v1',
          time: 1586629801,
          signature: 'fake-sig-1',
          payer: 'my-address',
          payee: 'some-other-address',
          nonce: 54,
          height: 12345,
          hash: 'fake-hash-1',
          fee: 0,
          amount: 10000,
        },
        {
          type: 'payment_v1',
          time: 1585784540,
          signature: 'fake-sig-2',
          payer: 'some-other-address',
          payee: 'my-address',
          nonce: 53,
          height: 12344,
          hash: 'fake-hash-2',
          fee: 0,
          amount: 20000,
        },
      ],
    })

  it('lists transactions', async () => {
    const client = new Client()
    const list = await client.block('fake-hash').transactions.list()
    const payments = (await list.take(2)) as PaymentV1[]
    expect(payments[0].amount.integerBalance).toBe(10000)
    expect(payments[1].amount.integerBalance).toBe(20000)
  })
})

describe('list from hotspot', () => {
  nock('https://api.helium.io')
    .get('/v1/hotspots/fake-hotspot-address/activity')
    .reply(200, {
      data: [
        {
          type: 'assert_location_v1',
          time: 1587251449,
          staking_fee: 1,
          payer: 'fake-payer-address',
          owner: 'fake-owner-addres',
          nonce: 1,
          location: 'fake-h3-location',
          lng: -123.03528172874591,
          lat: 40.82000831418664,
          height: 100000,
          hash: 'fake-hash-1',
          gateway: 'fake-gateway',
          fee: 0,
        },
        {
          type: 'add_gateway_v1',
          time: 1587249256,
          staking_fee: 1,
          payer: 'fake-payer-address',
          owner: 'fake-owner-address',
          height: 100000,
          hash: 'fake-hash-2',
          gateway: 'fake-gateway',
          fee: 0,
        },
      ],
    })

  it('lists transaction activity for an account', async () => {
    const client = new Client()
    const list = await client.hotspot('fake-hotspot-address').activity.list()
    const txns = (await list.take(2)) as any[]
    expect(txns[0].hash).toBe('fake-hash-1')
    expect(txns[1].hash).toBe('fake-hash-2')
  })
})

describe('list without a block or account', () => {
  it('throws an error', async () => {
    const client = new Client()

    const makeList = async () => {
      await client.transactions.list()
    }
    await expect(makeList()).rejects.toThrow()
  })
})
