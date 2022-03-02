import nock from 'nock'
import Address, { NetTypes } from '@helium/address'
import Client from '../../Client'

// eslint-disable-next-line import/prefer-default-export
export const validatorFixture = (params = {}) => ({
  version_heartbeat: 10000008,
  status: { online: 'online', listen_addrs: ['/ip4/11.111.111.111/tcp/2154'], height: 923303 },
  stake_status: 'staked',
  stake: 1000000000000,
  penalty: 1.123,
  penalties: [
    { type: 'performance', height: 921773, amount: 0.099 },
    { type: 'tenure', height: 921622, amount: 0.5 },
  ],
  owner: 'fake-owner-address',
  name: 'fake-name',
  last_heartbeat: 923338,
  block_added: 123456,
  block: 923409,
  address: 'fake-validator-address',
  ...params,
})

export const rewardsFixture = () => ({
  data: [
    {
      timestamp: '2020-12-17T19:23:30.000000Z',
      hash: 'mock-hash',
      gateway: 'mock-gateway',
      block: 681810,
      amount: 206665349,
      account: 'mock-account',
    },
    {
      timestamp: '2020-12-17T17:31:36.000000Z',
      hash: 'mock-hash',
      gateway: 'mock-gateway',
      block: 681693,
      amount: 240226051,
      account: 'mock-account',
    },
    {
      timestamp: '2020-12-17T16:51:34.000000Z',
      hash: 'mock-hash',
      gateway: 'mock-gateway',
      block: 681645,
      amount: 6454681,
      account: 'mock-account',
    },
  ],
})

export const rewardSumFixture = () => ({
  meta: {
    min_time: '2020-12-17T00:00:00Z',
    max_time: '2020-12-18T00:00:00Z',
  },
  data: {
    total: 13.17717245,
    sum: 1317717245,
    stddev: 1.10445133,
    min: 0,
    median: 1.98726309,
    max: 2,
    avg: 1.4641302722222223,
  },
})

export const rewardSumListFixture = () => ({
  meta: {
    min_time: '2020-12-17T00:00:00Z',
    max_time: '2020-12-18T00:00:00Z',
  },
  data: [
    {
      total: 13.17717245,
      sum: 1317717245,
      stddev: 1.10445133,
      min: 0,
      median: 1.98726309,
      max: 2,
      avg: 1.4641302722222223,
    },
  ],
})

Address.fromB58 = jest.fn(() => new Address(0, NetTypes.MAINNET, 0, new Uint8Array()))

describe('get', () => {
  nock('https://api.helium.io').get('/v1/validators/fake-validator-address').reply(200, {
    data: validatorFixture(),
  })

  it('retrieves a validator by address', async () => {
    const client = new Client()
    const validator = await client.validators.get('fake-validator-address')
    expect(validator.name).toBe('fake-name')
    expect(validator.owner).toBe('fake-owner-address')
  })
})

describe('list', () => {
  nock('https://api.helium.io')
    .get('/v1/validators')
    .reply(200, {
      data: [validatorFixture({ name: 'validator-1' }), validatorFixture({ name: 'validator-2' })],
    })

  it('lists validators', async () => {
    const client = new Client()
    const list = await client.validators.list()
    const validators = await list.take(2)
    expect(validators[0].name).toBe('validator-1')
    expect(validators[0].status?.listenAddrs[0]).toBe('/ip4/11.111.111.111/tcp/2154')
    expect(validators[1].name).toBe('validator-2')
    expect(validators[1].status?.listenAddrs[0]).toBe('/ip4/11.111.111.111/tcp/2154')
  })
})

describe('list from account', () => {
  nock('https://api.helium.io')
    .get('/v1/accounts/fake-address/validators')
    .reply(200, {
      data: [validatorFixture({ name: 'validator-1' }), validatorFixture({ name: 'validator-2' })],
    })

  it('lists validators from an account', async () => {
    const client = new Client()
    const list = await client.account('fake-address').validators.list()
    const validators = await list.take(2)
    expect(validators[0].name).toBe('validator-1')
    expect(validators[1].name).toBe('validator-2')
  })
})

describe('listJson', () => {
  nock('https://api.helium.io')
    .get('/v1/validators')
    .reply(200, {
      data: [
        validatorFixture({ name: 'validator-1' }),
        validatorFixture({ name: 'validator-2' }),
        validatorFixture({ name: 'validator-3' }),
        validatorFixture({ name: 'validator-4' }),
      ],
    })

  it('lists validators', async () => {
    const client = new Client()
    const list = await client.validators.list()
    const validators = await list.takeJSON(2)
    expect(validators[0].name).toBe('validator-1')
    expect(validators[1].name).toBe('validator-2')
    const validators2 = await list.takeJSON(2)
    expect(validators2[0].name).toBe('validator-3')
    expect(validators2[1].name).toBe('validator-4')
  })
})

describe('search by validator name', () => {
  nock('https://api.helium.io')
    .get('/v1/validators/name')
    .query({ search: 'chicken-burrito' })
    .reply(200, {
      data: [
        validatorFixture({ name: 'chicken-burrito-guacamole' }),
        validatorFixture({ name: 'chicken-burrito-salsa' }),
      ],
    })

  it('lists validators', async () => {
    const client = new Client()
    const list = await client.validators.search('chicken-burrito')
    const validators = await list.take(2)
    expect(validators[0].name).toBe('chicken-burrito-guacamole')
    expect(validators[1].name).toBe('chicken-burrito-salsa')
  })
})

describe('elected', () => {
  nock('https://api.helium.io')
    .get('/v1/validators/elected/123456')
    .reply(200, {
      data: [
        validatorFixture({ name: 'previous-consensus-validator-1' }),
        validatorFixture({ name: 'previous-consensus-validator-2' }),
        validatorFixture({ name: 'previous-consensus-validator-3' }),
      ],
    })
  nock('https://api.helium.io')
    .get('/v1/validators/elected')
    .reply(200, {
      data: [
        validatorFixture({ name: 'current-consensus-validator-1' }),
        validatorFixture({ name: 'current-consensus-validator-2' }),
        validatorFixture({ name: 'current-consensus-validator-3' }),
      ],
    })

  it('retrieves elected validators at a given block height', async () => {
    const client = new Client()
    const list = await client.validators.elected(123456)
    const elected = await list.take(3)
    expect(elected.length).toBe(3)
    expect(elected[0].name).toBe('previous-consensus-validator-1')
    expect(elected[elected.length - 1].name).toBe('previous-consensus-validator-3')
  })

  it('retrieves currently elected validators', async () => {
    const client = new Client()
    const list = await client.validators.elected()
    const elected = await list.take(3)
    expect(elected.length).toBe(3)
    expect(elected[0].name).toBe('current-consensus-validator-1')
    expect(elected[elected.length - 1].name).toBe('current-consensus-validator-3')
  })
})

describe('get rewards', () => {
  nock('https://api.helium.io')
    .get(
      '/v1/validators/fake-address/rewards/sum?min_time=2020-12-17T00%3A00%3A00.000Z&max_time=2020-12-18T00%3A00%3A00.000Z',
    )
    .reply(200, rewardSumFixture())

  nock('https://api.helium.io')
    .get(
      '/v1/validators/fake-address/rewards?min_time=2020-12-17T00%3A00%3A00.000Z&max_time=2020-12-18T00%3A00%3A00.000Z',
    )
    .reply(200, rewardsFixture())

  nock('https://api.helium.io')
    .get(
      '/v1/validators/fake-address/rewards/sum?min_time=2020-12-17T00%3A00%3A00.000Z&max_time=2020-12-18T00%3A00%3A00.000Z&bucket=day',
    )
    .reply(200, rewardSumListFixture())

  nock('https://api.helium.io')
    .get('/v1/validators/fake-address/rewards/sum?min_time=-1%20day&bucket=day')
    .reply(200, rewardSumListFixture())

  it('gets validator rewards sum', async () => {
    const minTime = new Date('2020-12-17T00:00:00Z')
    const maxTime = new Date('2020-12-18T00:00:00Z')
    const client = new Client()
    const rewards = await client.validator('fake-address').rewards.sum.get(minTime, maxTime)
    expect(rewards.balanceTotal.floatBalance).toBe(13.17717245)
    expect(rewards.total).toBe(13.17717245)
    expect(rewards.data.total).toBe(13.17717245)
  })

  it('list validator rewards', async () => {
    const minTime = new Date('2020-12-17T00:00:00Z')
    const maxTime = new Date('2020-12-18T00:00:00Z')
    const client = new Client()
    const rewardsList = await client.validator('fake-address').rewards.list({ minTime, maxTime })
    const rewards = await rewardsList.take(5)
    expect(rewards.length).toBe(3)
    expect(rewards[0].gateway).toBe('mock-gateway')
    expect(rewards[1].gateway).toBe('mock-gateway')
    expect(rewards[2].gateway).toBe('mock-gateway')
    expect(rewards[0].gateway).toBe('mock-gateway')
  })

  it('list validator reward sums no bucket', async () => {
    const minTime = new Date('2020-12-17T00:00:00Z')
    const maxTime = new Date('2020-12-18T00:00:00Z')
    const client = new Client()
    expect.assertions(1)
    try {
      await client.validator('fake-address').rewards.sum.list({ minTime, maxTime })
    } catch (error) {
      expect(error.message).toBe('missing bucket param')
    }
  })

  it('list validator reward sums by date', async () => {
    const minTime = new Date('2020-12-17T00:00:00Z')
    const maxTime = new Date('2020-12-18T00:00:00Z')
    const client = new Client()
    const rewardsList = await client
      .validator('fake-address')
      .rewards.sum.list({ minTime, maxTime, bucket: 'day' })
    const rewards = await rewardsList.take(5)
    expect(rewards.length).toBe(1)
    expect(rewards[0].balanceTotal.floatBalance).toBe(13.17717245)
    expect(rewards[0].total).toBe(13.17717245)
  })

  it('list validator reward sums by bucket', async () => {
    const minTime = '-1 day'
    const client = new Client()
    const rewardsList = await client
      .validator('fake-address')
      .rewards.sum.list({ minTime, bucket: 'day' })
    const rewards = await rewardsList.take(5)
    expect(rewards.length).toBe(1)
    expect(rewards[0].balanceTotal.floatBalance).toBe(13.17717245)
    expect(rewards[0].total).toBe(13.17717245)
  })
})
