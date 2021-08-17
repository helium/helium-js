import nock from 'nock'
import Client from '../../Client'

describe('get location', () => {
  nock('https://api.helium.io')
    .get('/v1/locations/mock-location')
    .reply(200, {
      data: {
        short_street: 'short street',
        short_state: 'short state',
        short_country: 'short country',
        short_city: 'short city',
        long_street: 'long street',
        long_state: 'long state',
        long_country: 'long country',
        long_city: 'long city',
        location: 'mock-location',
        city_id: 'city id',
      },
    })

  it('gets location details', async () => {
    const client = new Client()
    const location = await client.locations.get('mock-location')
    expect(location.shortStreet).toBe('short street')
    expect(location.shortState).toBe('short state')
    expect(location.shortCountry).toBe('short country')
    expect(location.shortCity).toBe('short city')
    expect(location.longStreet).toBe('long street')
    expect(location.longState).toBe('long state')
    expect(location.longCountry).toBe('long country')
    expect(location.longCity).toBe('long city')
    expect(location.location).toBe('mock-location')
    expect(location.cityId).toBe('city id')
  })
})
