import nock from 'nock'
import Client from '../../Client'

export const witnessFixture = (params = {}) => ({
  score_update_height: 213456,
  score: 0.25,
  reward_scale: 0.07049560546875,
  owner: 'fake-owner-address',
  name: 'some-hotspot-name',
  location: 'an-h3-address',
  location_hex: 'an-h3-address-hex',
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
  gain: 12,
  elevation: 3,
  witness_info: {
    recent_time: '1618969231803488000',
    histogram: {
      28: 0,
      '-92': 21,
      '-84': 9,
      '-76': 0,
      '-68': 0,
      '-60': 0,
      '-132': 0,
      '-124': 0,
      '-116': 0,
      '-108': 0,
      '-100': 1,
    },
    first_time: '1618163719840575700',
  },
  witness_for: 'fake-witness-for-address',
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

describe('list witnesses', () => {
  nock('https://api.helium.io')
    .get('/v1/hotspots/fake-address/witnesses')
    .reply(200, {
      data: [witnessFixture({ name: 'hotspot-1' }), witnessFixture({ name: 'hotspot-2' })],
    })

  nock('https://api.helium.io')
    .get('/v1/hotspots/fake-address/witnessed')
    .reply(200, {
      data: [witnessFixture({ name: 'hotspot-1' }), witnessFixture({ name: 'hotspot-2' })],
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
    const witnesses = await list.take(2)
    expect(witnesses[0].name).toBe('hotspot-1')
    expect(witnesses[0].name).toBe('hotspot-1')
    expect(witnesses[1].location).toBe('an-h3-address')
    expect(witnesses[1].locationHex).toBe('an-h3-address-hex')
    expect(witnesses[0].witnessFor).toBe('fake-witness-for-address')
    expect(witnesses[0].witnessInfo?.histogram?.['-92']).toBe(21)
    expect(witnesses[0].witnessInfo?.recentTime).toBe('1618969231803488000')
    expect(witnesses[0].witnessInfo?.firstTime).toBe('1618163719840575700')
  })

  it('lists witnessed hotspots', async () => {
    const client = new Client()
    const list = await client.hotspot('fake-address').witnessed.list()
    const witnesses = await list.take(2)
    expect(witnesses[0].name).toBe('hotspot-1')
    expect(witnesses[0].name).toBe('hotspot-1')
    expect(witnesses[1].location).toBe('an-h3-address')
    expect(witnesses[1].locationHex).toBe('an-h3-address-hex')
    expect(witnesses[0].witnessFor).toBe('fake-witness-for-address')
    expect(witnesses[0].witnessInfo?.histogram?.['-92']).toBe(21)
    expect(witnesses[0].witnessInfo?.recentTime).toBe('1618969231803488000')
    expect(witnesses[0].witnessInfo?.firstTime).toBe('1618163719840575700')
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
