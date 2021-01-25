import nock from 'nock'
import Client from '../../Client'

// eslint-disable-next-line import/prefer-default-export
export const hotspotFixture = (params = {}) => ({
  score_update_height: 213456,
  score: 0.25,
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
  address: 'fake-hotspot-address',
  ...params,
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

describe('list witnesses', () => {
  nock('https://api.helium.io')
    .get('/v1/hotspots/fake-address/witnesses')
    .reply(200, {
      data: [hotspotFixture({ name: 'hotspot-1' }), hotspotFixture({ name: 'hotspot-2' })],
    })

  it('lists hotspots witnesses', async () => {
    const client = new Client()
    const list = await client.hotspot('fake-address').witnesses.list()
    const hotspots = await list.take(2)
    expect(hotspots[0].name).toBe('hotspot-1')
    expect(hotspots[1].name).toBe('hotspot-2')
  })
})

describe('get rewards', () => {
  nock('https://api.helium.io')
    .get('/v1/hotspots/fake-address/rewards/sum?min_time=2020-12-17T00%3A00%3A00.000Z&max_time=2020-12-18T00%3A00%3A00.000Z')
    .reply(200, rewardSumFixture())

  nock('https://api.helium.io')
    .get('/v1/hotspots/fake-address/rewards?min_time=2020-12-17T00%3A00%3A00.000Z&max_time=2020-12-18T00%3A00%3A00.000Z')
    .reply(200, rewardsFixture())

  it('gets hotspot rewards sum', async () => {
    const minTime = new Date('2020-12-17T00:00:00Z')
    const maxTime = new Date('2020-12-18T00:00:00Z')
    const client = new Client()
    const rewards = await client.hotspot('fake-address').rewards.getSum(minTime, maxTime)
    expect(rewards.total.floatBalance).toBe(13.17717245)
    expect(rewards.maxTime).toBe('2020-12-18T00:00:00Z')
    expect(rewards.data.total.floatBalance).toBe(13.17717245)
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
