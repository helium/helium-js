import nock from 'nock'
import Address, { NetTypes } from '@helium/address'
import Client from '../../Client'

Address.fromB58 = jest.fn(() => new Address(0, NetTypes.MAINNET, 0, new Uint8Array()))

// eslint-disable-next-line import/prefer-default-export
export const challengeFixture = (params = {}) => ({
  type: 'poc_receipts_v1',
  time: 1589918979,
  signature: 'fake-sig',
  secret: 'fake-secret',
  path: [
    {
      witnesses: [],
      receipt: {
        timestamp: 1589918521291550000,
        signature: 'fake-sig',
        signal: 0,
        origin: 'p2p',
        gateway: 'fake-gateway',
        data: 'bLU',
      },
      challengee: 'fake-challengee',
    },
  ],
  onion_key_hash: 'fake-onion-key-hash',
  height: 339367,
  hash: 'fake-hash',
  fee: 0,
  challenger_owner: 'fake-challenger-owner',
  challenger_lon: -171.00671674931,
  challenger_loc: 'fake-challenger-loc',
  challenger_lat: 148.845751328918,
  challenger: 'fake-challenger',
  ...params,
})

describe('get', () => {
  nock('https://api.helium.io')
    .get('/v1/challenges/fake-hash')
    .reply(200, {
      data: challengeFixture(),
    })

  it('retrieves a challenge by hash', async () => {
    const client = new Client()
    const challenge = await client.challenges.get('fake-hash')
    expect(challenge.hash).toBe('fake-hash')
  })
})

describe('list', () => {
  nock('https://api.helium.io')
    .get('/v1/challenges')
    .reply(200, {
      data: [
        challengeFixture({ hash: 'fake-hash-1' }),
        challengeFixture({ hash: 'fake-hash-2' }),
      ],
    })

  it('lists challenges', async () => {
    const client = new Client()
    const list = await client.challenges.list()
    const challenges = await list.take(2)
    expect(challenges[0].hash).toBe('fake-hash-1')
    expect(challenges[1].hash).toBe('fake-hash-2')
  })
})

describe('list from account', () => {
  nock('https://api.helium.io')
    .get('/v1/accounts/fake-address/challenges')
    .reply(200, {
      data: [
        challengeFixture({ hash: 'fake-hash-1' }),
        challengeFixture({ hash: 'fake-hash-2' }),
      ],
    })

  it('lists challenges from an account', async () => {
    const client = new Client()
    const list = await client.account('fake-address').challenges.list()
    const challenges = await list.take(2)
    expect(challenges[0].hash).toBe('fake-hash-1')
    expect(challenges[1].hash).toBe('fake-hash-2')
  })
})
