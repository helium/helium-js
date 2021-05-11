import Client from '../../Client'
import Hotspot from '../Hotspot'

test('create Hotspot from HTTP response', () => {
  const hotspot = new Hotspot(new Client(), {
    speculative_nonce: 2,
    lng: -123.1234567890,
    lat: 12.34567890123,
    timestamp_added: '2021-05-11T21:01:17.000000Z',
    status: {
      gps: 'mock-gps',
      online: 'online',
      listen_addrs: [
        '/ip4/12.345.678.901/tcp/57449',
      ],
      height: 123456,
    },
    reward_scale: 1,
    owner: 'mock-owner',
    nonce: 1,
    name: 'mock-name',
    location: 'mock-location',
    last_poc_challenge: 123456,
    last_change_block: 123456,
    geocode: {
      short_street: 'mock-short-street',
      short_state: 'CA',
      short_country: 'US',
      short_city: 'mock-short-city',
      long_street: 'mock-long-street',
      long_state: 'California',
      long_country: 'United States',
      long_city: 'mock-long-city',
      city_id: 'mock-city-id',
    },
    gain: 12,
    elevation: 0,
    block_added: 123456,
    block: 123456,
    address: 'mock-address',
  })
  expect(hotspot.address).toBe('mock-address')
  expect(hotspot.speculativeNonce).toBe(2)
  expect(hotspot.nonce).toBe(1)
  expect(hotspot.rewardScale).toBe(1)
  expect(hotspot.geocode?.longCity).toBe('mock-long-city')
  expect(hotspot.blockAdded).toBe(123456)
})
