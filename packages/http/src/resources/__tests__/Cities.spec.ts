import nock from 'nock'
import Client from '../../Client'
import { hotspotFixture } from './Hotspots.spec'

const citiesFixture = (params = {}) => ({
  short_state: 'mock short_state',
  short_country: 'mock short_country',
  short_city: 'mock short_city',
  long_state: 'mock long_state',
  long_country: 'mock long_country',
  long_city: 'mock long_city',
  hotspot_count: 100,
  ...params,
})

describe('list', () => {
  nock('https://api.helium.io')
    .get('/v1/cities?search=san%20francisco')
    .reply(200, {
      data: [
        citiesFixture({ city_id: 'mock-sf-1' }),
        citiesFixture({ city_id: 'mock-sf-2' }),
      ],
    })

  nock('https://api.helium.io')
    .get('/v1/cities')
    .reply(200, {
      data: [
        citiesFixture({ city_id: 'mock-1' }),
        citiesFixture({ city_id: 'mock-2' }),
        citiesFixture({ city_id: 'mock-3' }),
      ],
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

  it('searches cities', async () => {
    const client = new Client()
    const list = await client.cities.list({ query: 'san francisco' })
    const cities = await list.take(10)
    expect(cities.length).toBe(2)
    expect(cities[0].cityId).toBe('mock-sf-1')
    expect(cities[1].cityId).toBe('mock-sf-2')
  })
})

describe('getHotspots', () => {
  nock('https://api.helium.io')
    .get('/v1/cities/mock-id/hotspots')
    .reply(200, {
      data: [
        hotspotFixture({ name: 'hotspot-1' }),
        hotspotFixture({ name: 'hotspot-2' }),
      ],
    })

  it('lists hotspots in a city', async () => {
    const client = new Client()
    const list = await client.cities.getHotspots({ cityId: 'mock-id' })
    const hotspots = await list.take(2)
    expect(hotspots[0].name).toBe('hotspot-1')
    expect(hotspots[1].name).toBe('hotspot-2')
  })

  it('requires a city id', async () => {
    expect.assertions(1)
    const client = new Client()
    try {
      await client.cities.getHotspots()
    } catch (error) {
      expect(error.message).toBe('you must provide a city id')
    }
  })
})
