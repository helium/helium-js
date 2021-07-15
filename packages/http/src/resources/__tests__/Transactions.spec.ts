import nock from 'nock'
import Client from '../../Client'
import {
  UnknownTransaction,
  PaymentV1,
  AssertLocationV1,
  AddGatewayV1,
  TokenBurnV1,
  AssertLocationV2,
} from '../../index'
import { RewardsV2 } from '../../models/Transaction'

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
    const list = await client.account('my-address').activity.list({ filterTypes: ['payment_v1'] })
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
    const payments = await list.take(2)
    const txn0 = payments[0]
    const txn1 = payments[1]
    expect(txn0 instanceof PaymentV1).toBeTruthy()
    expect(txn1 instanceof PaymentV1).toBeTruthy()

    expect((txn0 as PaymentV1).amount.integerBalance).toBe(10000)
    expect((txn1 as PaymentV1).amount.integerBalance).toBe(20000)
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
        {
          type: 'some_future_type',
          time: 1587299256,
        },
        {
          type: 'token_burn_v1',
          time: 1611090989,
          payer: '1398hLeHESZHE5jVtaLAV5fdg2vrUeZEs2B92t7TzeQTtugr8dL',
          payee: '13daGGWvDQyTyHFDCPz8zDSVTWgPNNfJ4oh31Teec4TRWfjMx53',
          nonce: 28,
          memo: 'AAAAAAAAAAA=',
          height: 683373,
          hash: 'Dm7WReN3RpL0g5grUojWwavJJiweBEOWMkXjrXnPcNA',
          fee: 35000,
          amount: 500000000000,
        },
        {
          type: 'assert_location_v2',
          time: 1587251449,
          staking_fee: 1,
          payer: 'fake-payer-address',
          owner: 'fake-owner-addres',
          nonce: 1,
          location: 'fake-h3-location',
          lng: -123.03528172874591,
          lat: 40.82000831418664,
          height: 100000,
          hash: 'fake-hash-4',
          gateway: 'fake-gateway',
          gain: 12,
          fee: 0,
          elevation: 0,
        },
      ],
    })

  it('lists transaction activity for a hotspot', async () => {
    const client = new Client()
    const list = await client.hotspot('fake-hotspot-address').activity.list()
    const txns = await list.take(5)
    const txn0 = txns[0]
    const txn1 = txns[1]
    const txn2 = txns[2]
    const txn3 = txns[3]
    const txn4 = txns[4]
    expect(txn0 instanceof AssertLocationV1).toBeTruthy()
    expect(txn1 instanceof AddGatewayV1).toBeTruthy()
    expect(txn2 instanceof UnknownTransaction).toBeTruthy()
    expect(txn3 instanceof TokenBurnV1).toBeTruthy()
    expect(txn4 instanceof AssertLocationV2).toBeTruthy()

    expect((txn0 as AssertLocationV1).hash).toBe('fake-hash-1')
    expect((txn0 as AssertLocationV1).data.hash).toBe('fake-hash-1')
    expect((txn1 as AddGatewayV1).hash).toBe('fake-hash-2')
    expect((txn1 as AddGatewayV1).data.hash).toBe('fake-hash-2')
    expect((txn1 as AddGatewayV1).stakingFee.toDataCredits().toString()).toBe('1 DC')
    expect((txn2 as UnknownTransaction).time).toBe(1587299256)
    expect((txn3 as TokenBurnV1).fee.toDataCredits().toString()).toBe('35,000 DC')
    expect((txn4 as AssertLocationV2).hash).toBe('fake-hash-4')
    expect((txn4 as AssertLocationV2).gain).toBe(12)
    expect((txn4 as AssertLocationV2).elevation).toBe(0)
    expect((txn4 as AssertLocationV2).data.elevation).toBe(0)
  })
})

describe('list from validator', () => {
  nock('https://api.helium.io')
    .get('/v1/validators/fake-validator-address/activity')
    .reply(200, {
      data: [
        {
          version: 10000008,
          type: 'validator_heartbeat_v1',
          time: 1626147484,
          signature: 'fake-signature',
          height: 919213,
          hash: 'fake-hash-1',
          address: 'fake-validator-address',
        },
        {
          type: 'rewards_v2',
          time: 1626146826,
          start_epoch: 919169,
          rewards: [
            {
              type: 'consensus',
              gateway: 'fake-validator-address',
              amount: 520833333,
              account: 'fake-owner-address',
            },
          ],
          height: 919200,
          hash: 'fake-hash-2',
          end_epoch: 919199,
        },
      ],
    })

  it('lists transaction activity for a validator', async () => {
    const client = new Client()
    const list = await client.validator('fake-validator-address').activity.list()
    const [txn0, txn1] = await list.take(2)

    expect((txn0 as UnknownTransaction).time).toBe(1626147484)
    expect((txn0 as UnknownTransaction).data.type).toBe('validator_heartbeat_v1')
    expect((txn1 as RewardsV2).hash).toBe('fake-hash-2')
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
