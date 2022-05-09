import City from '../City'
import Client from '../../Client'

test('create City from HTTP response', () => {
  const client = new Client()
  const city = new City(client, {
    short_state: 'CA',
    short_country: 'US',
    short_city: 'SF',
    long_state: 'California',
    long_country: 'United States',
    long_city: 'San Francisco',
    hotspot_count: 228,
    city_id: 'c2FuIGZyYW5jaXNjb2NhbGlmb3JuaWF1bml0ZWQgc3RhdGVz',
  })
  expect(city.shortState).toBe('CA')
  expect(city.shortCountry).toBe('US')
  expect(city.shortCity).toBe('SF')
  expect(city.longState).toBe('California')
  expect(city.longCountry).toBe('United States')
  expect(city.longCity).toBe('San Francisco')
  expect(city.hotspotCount).toBe(228)
  expect(city.cityId).toBe('c2FuIGZyYW5jaXNjb2NhbGlmb3JuaWF1bml0ZWQgc3RhdGVz')
})
