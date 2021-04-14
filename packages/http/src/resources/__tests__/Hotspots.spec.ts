import nock from 'nock'
import Client from '../../Client'
import { challengeFixture } from './Challenges.spec'

// eslint-disable-next-line import/prefer-default-export
export const hotspotFixture = (params = {}) => ({
  score_update_height: 213456,
  score: 0.25,
  reward_scale: 0.07049560546875,
  owner: 'fake-owner-address',
  name: 'some-hotspot-name',
  location: 'an-h3-address',
  lng: -123.03528172874591,
  lat: 55.82000831418664,
  geocode: {
    short_street: 'Market St',
    short_state: 'CA',
    short_country: 'US',
    short_city: 'San Francisco',
    long_street: 'Market Street',
    long_state: 'California',
    long_country: 'United States',
    long_city: 'San Francisco',
  },
  block: 123456,
  timestamp_added: '2020-11-24T02:52:12.000000Z',
  last_poc_challenge: 213456,
  last_change_block: 213456,
  address: 'fake-hotspot-address',
  ...params,
})

export const witnessSumFixture = () => ({
  meta: {
    min_time: '2021-01-04T21:55:18Z',
    max_time: '2021-02-03T21:55:18Z',
    bucket: 'week',
  },
  data: [
    {
      timestamp: '2021-01-27T21:55:18.000000Z',
      stddev: 0.7387766471133708,
      min: 7,
      median: 9,
      max: 9,
      avg: 8.382978723404255,
    },
    {
      timestamp: '2021-01-20T21:55:18.000000Z',
      stddev: 3.327131676805893,
      min: 0,
      median: 6,
      max: 12,
      avg: 4.946428571428571,
    },
    {
      timestamp: '2021-01-13T21:55:18.000000Z',
      stddev: 0.8293691019953858,
      min: 10,
      median: 12,
      max: 12,
      avg: 11.416666666666666,
    },
    {
      timestamp: '2021-01-06T21:55:18.000000Z',
      stddev: 0.4562439130098156,
      min: 9,
      median: 10,
      max: 10,
      avg: 9.712121212121213,
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

export const challengeSumListFixture = () => ({
  meta: {
    min_time: '2020-12-17T00:00:00Z',
    max_time: '2020-12-18T00:00:00Z',
  },
  data: [
    {
      timestamp: '2020-12-17T00:00:00Z',
      sum: '40',
      stddev: 0.22629428592141426,
      min: 1,
      median: 1,
      max: 2,
      avg: 1.0526315789473684,
    },
    {
      timestamp: '2020-12-18T00:00:00Z',
      sum: '37',
      stddev: 0,
      min: 1,
      median: 1,
      max: 1,
      avg: 1,
    },
  ],
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

describe('get', () => {
  nock('https://api.helium.io').get('/v1/hotspots/fake-hotspot-address').reply(200, {
    data: hotspotFixture(),
  })

  it('retrieves a hotspot by address', async () => {
    const client = new Client()
    const hotspot = await client.hotspots.get('fake-hotspot-address')
    expect(hotspot.name).toBe('some-hotspot-name')
    expect(hotspot.timestampAdded).toBe('2020-11-24T02:52:12.000000Z')
    expect(hotspot.lastPocChallenge).toBe(213456)
    expect(hotspot.lastChangeBlock).toBe(213456)
    expect(hotspot.rewardScale).toBe(0.07049560546875)
  })
})

describe('elected', () => {
  nock('https://api.helium.io')
    .get('/v1/elected/123456')
    .reply(200, {
      data: [
        hotspotFixture({ name: 'previous-consensus-hotspot-1' }),
        hotspotFixture({ name: 'previous-consensus-hotspot-2' }),
        hotspotFixture({ name: 'previous-consensus-hotspot-3' }),
        hotspotFixture({ name: 'previous-consensus-hotspot-4' }),
        hotspotFixture({ name: 'previous-consensus-hotspot-5' }),
        hotspotFixture({ name: 'previous-consensus-hotspot-6' }),
        hotspotFixture({ name: 'previous-consensus-hotspot-7' }),
        hotspotFixture({ name: 'previous-consensus-hotspot-8' }),
        hotspotFixture({ name: 'previous-consensus-hotspot-9' }),
        hotspotFixture({ name: 'previous-consensus-hotspot-10' }),
        hotspotFixture({ name: 'previous-consensus-hotspot-11' }),
        hotspotFixture({ name: 'previous-consensus-hotspot-12' }),
        hotspotFixture({ name: 'previous-consensus-hotspot-13' }),
        hotspotFixture({ name: 'previous-consensus-hotspot-14' }),
        hotspotFixture({ name: 'previous-consensus-hotspot-15' }),
        hotspotFixture({ name: 'previous-consensus-hotspot-16' }),
      ],
    })
  nock('https://api.helium.io')
    .get('/v1/elected')
    .reply(200, {
      data: [
        hotspotFixture({ name: 'current-consensus-hotspot-1' }),
        hotspotFixture({ name: 'current-consensus-hotspot-2' }),
        hotspotFixture({ name: 'current-consensus-hotspot-3' }),
        hotspotFixture({ name: 'current-consensus-hotspot-4' }),
        hotspotFixture({ name: 'current-consensus-hotspot-5' }),
        hotspotFixture({ name: 'current-consensus-hotspot-6' }),
        hotspotFixture({ name: 'current-consensus-hotspot-7' }),
        hotspotFixture({ name: 'current-consensus-hotspot-8' }),
        hotspotFixture({ name: 'current-consensus-hotspot-9' }),
        hotspotFixture({ name: 'current-consensus-hotspot-10' }),
        hotspotFixture({ name: 'current-consensus-hotspot-11' }),
        hotspotFixture({ name: 'current-consensus-hotspot-12' }),
        hotspotFixture({ name: 'current-consensus-hotspot-13' }),
        hotspotFixture({ name: 'current-consensus-hotspot-14' }),
        hotspotFixture({ name: 'current-consensus-hotspot-15' }),
        hotspotFixture({ name: 'current-consensus-hotspot-16' }),
      ],
    })

  it('retrieves elected hotspots at a given block height', async () => {
    const client = new Client()
    const list = await client.hotspots.elected(123456)
    const elected = await list.take(16)
    expect(elected.length).toBe(16)
    expect(elected[0].name).toBe('previous-consensus-hotspot-1')
    expect(elected[elected.length - 1].name).toBe('previous-consensus-hotspot-16')
  })

  it('retrieves currently elected hotspots', async () => {
    const client = new Client()
    const list = await client.hotspots.elected()
    const elected = await list.take(16)
    expect(elected.length).toBe(16)
    expect(elected[0].name).toBe('current-consensus-hotspot-1')
    expect(elected[elected.length - 1].name).toBe('current-consensus-hotspot-16')
  })
})

describe('list', () => {
  nock('https://api.helium.io')
    .get('/v1/hotspots')
    .reply(200, {
      data: [hotspotFixture({ name: 'hotspot-1' }), hotspotFixture({ name: 'hotspot-2' })],
    })

  it('lists hotspots', async () => {
    const client = new Client()
    const list = await client.hotspots.list()
    const hotspots = await list.take(2)
    expect(hotspots[0].name).toBe('hotspot-1')
    expect(hotspots[1].name).toBe('hotspot-2')
  })
})

describe('listJson', () => {
  nock('https://api.helium.io')
    .get('/v1/hotspots')
    .reply(200, {
      data: [
        hotspotFixture({ name: 'hotspot-1' }),
        hotspotFixture({ name: 'hotspot-2' }),
        hotspotFixture({ name: 'hotspot-3' }),
        hotspotFixture({ name: 'hotspot-4' }),
      ],
    })

  it('lists hotspots', async () => {
    const client = new Client()
    const list = await client.hotspots.list()
    const hotspots = await list.takeJSON(2)
    expect(hotspots[0].name).toBe('hotspot-1')
    expect(hotspots[1].name).toBe('hotspot-2')
    const hotspots2 = await list.takeJSON(2)
    expect(hotspots2[0].name).toBe('hotspot-3')
    expect(hotspots2[1].name).toBe('hotspot-4')
  })
})

describe('search by hotspot name', () => {
  nock('https://api.helium.io')
    .get('/v1/hotspots/name')
    .query({ search: 'chicken-burrito' })
    .reply(200, {
      data: [hotspotFixture({ name: 'chicken-burrito-guacamole' }), hotspotFixture({ name: 'chicken-burrito-salsa' })],
    })

  it('lists hotspots', async () => {
    const client = new Client()
    const list = await client.hotspots.search('chicken-burrito')
    const hotspots = await list.take(2)
    expect(hotspots[0].name).toBe('chicken-burrito-guacamole')
    expect(hotspots[1].name).toBe('chicken-burrito-salsa')
  })
})

describe('list witnesses', () => {
  nock('https://api.helium.io')
    .get('/v1/hotspots/fake-address/witnesses')
    .reply(200, {
      data: [hotspotFixture({ name: 'hotspot-1' }), hotspotFixture({ name: 'hotspot-2' })],
    })

  nock('https://api.helium.io')
    .get(
      '/v1/hotspots/fake-address/witnesses/sum?min_time=2020-12-17T00%3A00%3A00.000Z&max_time=2020-12-18T00%3A00%3A00.000Z&bucket=week',
    )
    .reply(200, witnessSumFixture())

  nock('https://api.helium.io')
    .get('/v1/hotspots/fake-address/witnesses/sum?min_time=-30%20day&bucket=week')
    .reply(200, witnessSumFixture())

  it('lists hotspots witnesses', async () => {
    const client = new Client()
    const list = await client.hotspot('fake-address').witnesses.list()
    const hotspots = await list.take(2)
    expect(hotspots[0].name).toBe('hotspot-1')
    expect(hotspots[1].name).toBe('hotspot-2')
  })

  it('lists hotspot witness sums with date time', async () => {
    const client = new Client()
    const list = await client
      .hotspot('fake-address')
      .witnesses.sum.list({ minTime: '-30 day', bucket: 'week' })
    const witnessSums = await list.take(4)
    expect(witnessSums.length).toBe(4)
    expect(witnessSums[0].max).toBe(9)
  })

  it('lists hotspot witness sums with string time', async () => {
    const client = new Client()
    const minTime = new Date('2020-12-17T00:00:00Z')
    const maxTime = new Date('2020-12-18T00:00:00Z')
    const list = await client
      .hotspot('fake-address')
      .witnesses.sum.list({ minTime, maxTime, bucket: 'week' })
    const witnessSums = await list.take(4)
    expect(witnessSums.length).toBe(4)
    expect(witnessSums[0].max).toBe(9)
  })
})

describe('get rewards', () => {
  nock('https://api.helium.io')
    .get(
      '/v1/hotspots/fake-address/rewards/sum?min_time=2020-12-17T00%3A00%3A00.000Z&max_time=2020-12-18T00%3A00%3A00.000Z',
    )
    .reply(200, rewardSumFixture())

  nock('https://api.helium.io')
    .get(
      '/v1/hotspots/fake-address/rewards?min_time=2020-12-17T00%3A00%3A00.000Z&max_time=2020-12-18T00%3A00%3A00.000Z',
    )
    .reply(200, rewardsFixture())

  nock('https://api.helium.io')
    .get(
      '/v1/hotspots/fake-address/rewards/sum?min_time=2020-12-17T00%3A00%3A00.000Z&max_time=2020-12-18T00%3A00%3A00.000Z&bucket=day',
    )
    .reply(200, rewardSumListFixture())

  nock('https://api.helium.io')
    .get('/v1/hotspots/fake-address/rewards/sum?min_time=-1%20day&bucket=day')
    .reply(200, rewardSumListFixture())

  it('gets hotspot rewards sum', async () => {
    const minTime = new Date('2020-12-17T00:00:00Z')
    const maxTime = new Date('2020-12-18T00:00:00Z')
    const client = new Client()
    const rewards = await client.hotspot('fake-address').rewards.sum.get(minTime, maxTime)
    expect(rewards.balanceTotal.floatBalance).toBe(13.17717245)
    expect(rewards.total).toBe(13.17717245)
    expect(rewards.data.total).toBe(13.17717245)
  })

  it('list hotspot rewards', async () => {
    const minTime = new Date('2020-12-17T00:00:00Z')
    const maxTime = new Date('2020-12-18T00:00:00Z')
    const client = new Client()
    const rewardsList = await client.hotspot('fake-address').rewards.list({ minTime, maxTime })
    const rewards = await rewardsList.take(5)
    expect(rewards.length).toBe(3)
    expect(rewards[0].gateway).toBe('mock-gateway')
    expect(rewards[1].gateway).toBe('mock-gateway')
    expect(rewards[2].gateway).toBe('mock-gateway')
    expect(rewards[0].gateway).toBe('mock-gateway')
  })

  it('list hotspot reward sums no bucket', async () => {
    const minTime = new Date('2020-12-17T00:00:00Z')
    const maxTime = new Date('2020-12-18T00:00:00Z')
    const client = new Client()
    expect.assertions(1)
    try {
      await client.hotspot('fake-address').rewards.sum.list({ minTime, maxTime })
    } catch (error) {
      expect(error.message).toBe('missing bucket param')
    }
  })

  it('list hotspot reward sums by date', async () => {
    const minTime = new Date('2020-12-17T00:00:00Z')
    const maxTime = new Date('2020-12-18T00:00:00Z')
    const client = new Client()
    const rewardsList = await client
      .hotspot('fake-address')
      .rewards.sum.list({ minTime, maxTime, bucket: 'day' })
    const rewards = await rewardsList.take(5)
    expect(rewards.length).toBe(1)
    expect(rewards[0].balanceTotal.floatBalance).toBe(13.17717245)
    expect(rewards[0].total).toBe(13.17717245)
  })

  it('list hotspot reward sums by bucket', async () => {
    const minTime = '-1 day'
    const client = new Client()
    const rewardsList = await client
      .hotspot('fake-address')
      .rewards.sum.list({ minTime, bucket: 'day' })
    const rewards = await rewardsList.take(5)
    expect(rewards.length).toBe(1)
    expect(rewards[0].balanceTotal.floatBalance).toBe(13.17717245)
    expect(rewards[0].total).toBe(13.17717245)
  })
})

describe('list from account', () => {
  nock('https://api.helium.io')
    .get('/v1/accounts/fake-address/hotspots')
    .reply(200, {
      data: [hotspotFixture({ name: 'hotspot-1' }), hotspotFixture({ name: 'hotspot-2' })],
    })

  it('lists hotspots from an account', async () => {
    const client = new Client()
    const list = await client.account('fake-address').hotspots.list()
    const hotspots = await list.take(2)
    expect(hotspots[0].name).toBe('hotspot-1')
    expect(hotspots[1].name).toBe('hotspot-2')
  })
})

describe('list from city', () => {
  nock('https://api.helium.io')
    .get('/v1/cities/fake-address/hotspots')
    .reply(200, {
      data: [hotspotFixture({ name: 'hotspot-1' }), hotspotFixture({ name: 'hotspot-2' })],
    })

  it('lists hotspots in a city', async () => {
    const client = new Client()
    const list = await client.city('fake-address').hotspots.list()
    const hotspots = await list.take(2)
    expect(hotspots[0].name).toBe('hotspot-1')
    expect(hotspots[1].name).toBe('hotspot-2')
  })
})

describe('challenges', () => {
  nock('https://api.helium.io')
    .get('/v1/hotspots/fake-address/challenges')
    .reply(200, {
      data: [challengeFixture({ hash: 'fake-hash-1' }), challengeFixture({ hash: 'fake-hash-2' })],
    })

  nock('https://api.helium.io')
    .get(
      '/v1/hotspots/fake-address/challenges/sum?min_time=2020-12-17T00%3A00%3A00.000Z&max_time=2020-12-18T00%3A00%3A00.000Z&bucket=day',
    )
    .reply(200, challengeSumListFixture())

  it('list challenges from hotspot', async () => {
    const client = new Client()
    const list = await client.hotspot('fake-address').challenges.list()
    const challenges = await list.take(2)
    expect(challenges[0].hash).toBe('fake-hash-1')
    expect(challenges[1].hash).toBe('fake-hash-2')
  })

  it('list challenge sums from hotspot', async () => {
    const minTime = new Date('2020-12-17T00:00:00Z')
    const maxTime = new Date('2020-12-18T00:00:00Z')
    const client = new Client()
    const list = await client
      .hotspot('fake-address')
      .challenges.sum.list({ minTime, maxTime, bucket: 'day' })
    const challenges = await list.take(2)
    expect(challenges[0].sum).toBe(40)
    expect(challenges[1].sum).toBe(37)
  })
})
