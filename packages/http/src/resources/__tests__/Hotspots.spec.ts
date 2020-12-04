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
