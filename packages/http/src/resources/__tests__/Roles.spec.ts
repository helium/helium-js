import nock from 'nock'
import Address, { NetTypes } from '@helium/address'
import Client from '../../Client'
import Role from '../../models/Role'

describe('list from account', () => {
  nock('https://api.helium.io')
    .get('/v1/accounts/my-address/roles')
    .reply(200, {
      data: [
        {
          type: 'payment_v2',
          time: 1586629801,
          role: 'payee',
          height: 12345,
          hash: 'fake-hash-1',
        },
        {
          type: 'rewards_v2',
          time: 1586629801,
          role: 'payee',
          height: 12345,
          hash: 'fake-hash-2',
        },
      ],
    })

  it('lists roles of recent activity for an account', async () => {
    const client = new Client()
    const list = await client.account('my-address').roles.list()
    const roles = (await list.take(2)) as Role[]
    expect(roles[0].hash).toBe('fake-hash-1')
    expect(roles[1].hash).toBe('fake-hash-2')
  })
})

Address.fromB58 = jest.fn(() => new Address(0, NetTypes.MAINNET, 0, new Uint8Array()))

describe('list from hotspot', () => {
  nock('https://api.helium.io')
    .get('/v1/hotspots/fake-hotspot-address/roles')
    .reply(200, {
      data: [
        {
          type: 'rewards_v2',
          time: 1638804232,
          role: 'reward_gateway',
          height: 1127817,
          hash: 'fake-hash-1',
        },
        {
          type: 'poc_receipts_v1',
          time: 1638804232,
          role: 'challenger',
          height: 1127818,
          hash: 'fake-hash-2',
        },
        {
          type: 'poc_request_v1',
          time: 1638804232,
          role: 'challenger',
          height: 1127819,
          hash: 'fake-hash-3',
        },
        {
          type: 'poc_request_v1',
          time: 1638804232,
          role: 'challenger',
          height: 1127820,
          hash: 'fake-hash-4',
        },
        {
          type: 'poc_receipts_v1',
          time: 1638804232,
          role: 'challengee',
          height: 1127821,
          hash: 'fake-hash-5',
        },
        {
          type: 'rewards_v2',
          time: 1638804232,
          role: 'reward_gateway',
          height: 1127822,
          hash: 'fake-hash-6',
        },
        {
          type: 'poc_receipts_v1',
          time: 1638804232,
          role: 'challenger',
          height: 1127823,
          hash: 'fake-hash-7',
        },
      ],
    })

  it('lists roles of recent activity for a hotspot', async () => {
    const client = new Client()
    const list = await client.hotspot('fake-hotspot-address').roles.list()
    const roles = (await list.take(7)) as Role[]
    const txn0 = roles[0]
    const txn1 = roles[1]
    const txn2 = roles[2]
    const txn3 = roles[3]
    const txn4 = roles[4]
    const txn5 = roles[5]
    const txn6 = roles[6]

    expect((txn0 as Role).type).toBe('rewards_v2')
    expect((txn1 as Role).role).toBe('challenger')
    expect((txn2 as Role).height).toBe(1127819)
    expect((txn3 as Role).hash).toBe('fake-hash-4')
    expect((txn4 as Role).role).toBe('challengee')
    expect((txn5 as Role).role).toBe('reward_gateway')
    expect((txn6 as Role).type).toBe('poc_receipts_v1')
  })
})

describe('list from validator', () => {
  nock('https://api.helium.io')
    .get('/v1/validators/fake-validator-address/roles')
    .reply(200, {
      data: [
        {
          type: 'validator_heartbeat_v1',
          time: 1638820953,
          role: 'validator',
          height: 1128100,
          hash: 'fake-hash-1',
        },
        {
          type: 'validator_heartbeat_v1',
          time: 1638814204,
          role: 'validator',
          height: 1128105,
          hash: 'fake-hash-2',
        },
        {
          type: 'validator_heartbeat_v1',
          time: 1638808868,
          role: 'validator',
          height: 1128110,
          hash: 'fake-hash-3',
        },
        {
          type: 'validator_heartbeat_v1',
          time: 1638803130,
          role: 'validator',
          height: 1128115,
          hash: 'fake-hash-4',
        },
      ],
    })

  it('lists roles of recent activity for a validator', async () => {
    const client = new Client()
    const list = await client.validator('fake-validator-address').roles.list()
    const [txn0, txn1, txn2, txn3] = (await list.take(4)) as Role[]

    expect((txn0 as Role).time).toBe(1638820953)
    expect((txn1 as Role).type).toBe('validator_heartbeat_v1')
    expect((txn2 as Role).hash).toBe('fake-hash-3')
    expect((txn3 as Role).hash).toBe('fake-hash-4')
  })
})
