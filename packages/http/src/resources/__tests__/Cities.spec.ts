import nock from 'nock'
import Client from '../../Client'

const citiesFixture = (params = {}) => ({
  short_state: 'mock short_state',
  short_country: 'mock short_country',
  short_city: 'mock short_city',
  long_state: 'mock long_state',
  long_country: 'mock long_country',
  long_city: 'mock long_city',
  hotspot_count: 100,
  online_count: 90,
  offline_count: 10,
  ...params,
})

describe('list', () => {
  nock('https://api.helium.io')
    .get('/v1/cities')
    .reply(200, {
      data: [
        citiesFixture({ city_id: 'mock-1' }),
        citiesFixture({ city_id: 'mock-2' }),
        citiesFixture({ city_id: 'mock-3' }),
      ],
    })

  nock('https://api.helium.io')
    .get('/v1/cities')
    .query({ order: 'hotspot_count' })
    .reply(200, {
      data: [citiesFixture({ city_id: 'mock-la-1' })],
    })

  nock('https://api.helium.io')
    .get('/v1/cities')
    .query({ order: 'online_count' })
    .reply(200, {
      data: [citiesFixture({ city_id: 'mock-nyc-1' })],
    })

  nock('https://api.helium.io')
    .get('/v1/cities')
    .query({ order: 'offline_count' })
    .reply(200, {
      data: [citiesFixture({ city_id: 'mock-chi-1' })],
    })

  it('lists cities', async () => {
    const client = new Client()
    const list = await client.cities.list()
    const cities = await list.take(10)
    expect(cities.length).toBe(3)
    expect(cities[0].cityId).toBe('mock-1')
    expect(cities[1].cityId).toBe('mock-2')
    expect(cities[2].cityId).toBe('mock-3')
  })

  it('orders by hotspot count', async () => {
    const client = new Client()
    const list = await client.cities.list({ order: 'hotspotCount' })
    const cities = await list.take(1)
    expect(cities[0].cityId).toBe('mock-la-1')
  })

  it('orders by online count', async () => {
    const client = new Client()
    const list = await client.cities.list({ order: 'onlineCount' })
    const cities = await list.take(1)
    expect(cities[0].cityId).toBe('mock-nyc-1')
  })

  it('orders by offline count', async () => {
    const client = new Client()
    const list = await client.cities.list({ order: 'offlineCount' })
    const cities = await list.take(1)
    expect(cities[0].cityId).toBe('mock-chi-1')
  })
})

describe('get', () => {
  nock('https://api.helium.io')
    .get('/v1/cities/mock-sf-1')
    .reply(200, {
      data: citiesFixture({ city_id: 'mock-sf-1' }),
    })

  it('gets city info for given city id', async () => {
    const client = new Client()
    const city = await client.cities.get('mock-sf-1')
    expect(city.cityId).toBe('mock-sf-1')
    expect(city.hotspotCount).toBe(100)
    expect(city.onlineCount).toBe(90)
    expect(city.offlineCount).toBe(10)
  })
})

describe('search', () => {
  nock('https://api.helium.io')
    .get('/v1/cities?search=san%20francisco')
    .reply(200, {
      data: [citiesFixture({ city_id: 'mock-sf-1' }), citiesFixture({ city_id: 'mock-sf-2' })],
    })

  it('searches cities', async () => {
    const client = new Client()
    const list = await client.cities.list({ query: 'san francisco' })
    const cities = await list.take(10)
    expect(cities.length).toBe(2)
    expect(cities[0].cityId).toBe('mock-sf-1')
    expect(cities[1].cityId).toBe('mock-sf-2')
  })
})
