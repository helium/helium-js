import nock from 'nock'
import Client from '../../Client'

const accountFixture = (params = {}) => ({
  speculative_nonce: 4,
  sec_nonce: 2,
  sec_balance: 3,
  nonce: 4,
  dc_nonce: 5,
  dc_balance: 6,
  block: 293601,
  balance: 10000,
  address: 'my-address',
  ...params,
})

const accountStatsFixture = (params = {}) => ({
  last_week: [
    {
      timestamp: '2020-06-30T00:00:00.000000Z',
      balance: 1,
    },
  ],
  last_month: [
    {
      timestamp: '2020-06-30T00:00:00.000000Z',
      balance: 1,
    },
    {
      timestamp: '2020-06-29T16:00:00.000000Z',
      balance: 2,
    },
  ],
  last_day: [],
  ...params,
})

describe('get', () => {
  nock('https://api.helium.io').get('/v1/accounts/my-address').reply(200, {
    data: accountFixture(),
  })

  it('retreives a specific account', async () => {
    const client = new Client()
    const account = await client.accounts.get('my-address')
    expect(account.speculativeNonce).toBe(4)
    expect(account.balance?.integerBalance).toBe(10000)
    expect(account.balance?.toString()).toBe('0.0001 HNT')
  })
})

describe('getStats', () => {
  nock('https://api.helium.io').get('/v1/accounts/my-address/stats').reply(200, {
    data: accountStatsFixture(),
  })

  it('retrieves account stats', async () => {
    const client = new Client()
    const stats = await client.accounts.getStats('my-address')
    expect(stats.lastWeek.length).toBe(1)
    expect(stats.lastMonth.length).toBe(2)
    expect(stats.lastDay.length).toBe(0)
  })
})

describe('list', () => {
  describe('with manual pagination', () => {
    nock('https://api.helium.io')
      .get('/v1/accounts')
      .reply(200, {
        data: [
          accountFixture({ address: 'address-1' }),
          accountFixture({ address: 'address-2' }),
        ],
        cursor: 'cursor-1',
      })

    nock('https://api.helium.io')
      .get('/v1/accounts')
      .query({ cursor: 'cursor-1' })
      .reply(200, {
        data: [
          accountFixture({ address: 'address-3' }),
          accountFixture({ address: 'address-4' }),
        ],
      })

    it('lists a page of accounts and exposes pagination functions', async () => {
      const client = new Client()
      const pageOne = await client.accounts.list()
      expect(pageOne.data[0].address).toBe('address-1')
      expect(pageOne.data[1].address).toBe('address-2')

      const pageTwo = await pageOne.nextPage()
      expect(pageTwo.data[0].address).toBe('address-3')
      expect(pageTwo.data[1].address).toBe('address-4')
    })
  })

  describe('with automatic pagination', () => {
    nock('https://api.helium.io')
      .get('/v1/accounts')
      .reply(200, {
        data: [
          accountFixture({ address: 'address-1' }),
          accountFixture({ address: 'address-2' }),
        ],
        cursor: 'cursor-1',
      })

    nock('https://api.helium.io')
      .get('/v1/accounts')
      .query({ cursor: 'cursor-1' })
      .reply(200, {
        data: [
          accountFixture({ address: 'address-3' }),
          accountFixture({ address: 'address-4' }),
        ],
      })

    it('lists accounts as an auto-paginating iterator', async () => {
      const client = new Client()
      const accounts = await client.accounts.list()

      const addresses = []

      for await (const account of accounts) {
        addresses.push(account.address)
      }
      expect(addresses).toEqual([
        'address-1',
        'address-2',
        'address-3',
        'address-4',
      ])
    })
  })
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
  data: [{
    total: 13.17717245,
    sum: 1317717245,
    stddev: 1.10445133,
    min: 0,
    median: 1.98726309,
    max: 2,
    avg: 1.4641302722222223,
  }],
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

describe('get rewards', () => {
  nock('https://api.helium.io')
    .get('/v1/accounts/fake-address/rewards/sum?min_time=2020-12-17T00%3A00%3A00.000Z&max_time=2020-12-18T00%3A00%3A00.000Z')
    .reply(200, rewardSumFixture())

  nock('https://api.helium.io')
    .get('/v1/accounts/fake-address/rewards?min_time=2020-12-17T00%3A00%3A00.000Z&max_time=2020-12-18T00%3A00%3A00.000Z')
    .reply(200, rewardsFixture())

  nock('https://api.helium.io')
    .get('/v1/accounts/fake-address/rewards/sum?min_time=2020-12-17T00%3A00%3A00.000Z&max_time=2020-12-18T00%3A00%3A00.000Z&bucket=day')
    .reply(200, rewardSumListFixture())

  nock('https://api.helium.io')
    .get('/v1/accounts/fake-address/rewards/sum?min_time=-1%20day&bucket=day')
    .reply(200, rewardSumListFixture())

  it('gets account rewards sum', async () => {
    const minTime = new Date('2020-12-17T00:00:00Z')
    const maxTime = new Date('2020-12-18T00:00:00Z')
    const client = new Client()
    const rewards = await client.account('fake-address').rewards.sum.get(minTime, maxTime)
    expect(rewards.balanceTotal.floatBalance).toBe(13.17717245)
    expect(rewards.data.total).toBe(13.17717245)
  })

  it('list account rewards', async () => {
    const minTime = new Date('2020-12-17T00:00:00Z')
    const maxTime = new Date('2020-12-18T00:00:00Z')
    const client = new Client()
    const rewardsList = await client.account('fake-address').rewards.list({ minTime, maxTime })
    const rewards = await rewardsList.take(5)
    expect(rewards.length).toBe(3)
    expect(rewards[0].gateway).toBe('mock-gateway')
    expect(rewards[1].gateway).toBe('mock-gateway')
    expect(rewards[2].gateway).toBe('mock-gateway')
    expect(rewards[0].gateway).toBe('mock-gateway')
  })

  it('list account reward sums no bucket', async () => {
    const minTime = new Date('2020-12-17T00:00:00Z')
    const maxTime = new Date('2020-12-18T00:00:00Z')
    const client = new Client()
    expect.assertions(1)
    try {
      await client.account('fake-address').rewards.sum.list({ minTime, maxTime })
    } catch (error) {
      expect(error.message).toBe('missing bucket param')
    }
  })

  it('list account reward sums by date', async () => {
    const minTime = new Date('2020-12-17T00:00:00Z')
    const maxTime = new Date('2020-12-18T00:00:00Z')
    const client = new Client()
    const rewardsList = await client.account('fake-address').rewards.sum.list({ minTime, maxTime, bucket: 'day' })
    const rewards = await rewardsList.take(5)
    expect(rewards.length).toBe(1)
    expect(rewards[0].balanceTotal.floatBalance).toBe(13.17717245)
  })

  it('list account reward sums by bucket', async () => {
    const minTime = '-1 day'
    const client = new Client()
    const rewardsList = await client.account('fake-address').rewards.sum.list({ minTime, bucket: 'day' })
    const rewards = await rewardsList.take(5)
    expect(rewards.length).toBe(1)
    expect(rewards[0].balanceTotal.floatBalance).toBe(13.17717245)
  })
})
