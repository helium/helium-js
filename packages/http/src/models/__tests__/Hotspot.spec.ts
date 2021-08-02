import Client from '../../Client'
import Hotspot from '../Hotspot'

test('create Hotspot from HTTP response', () => {
  const hotspot = new Hotspot(new Client(), {
    speculative_nonce: 2,
    lng: -123.1234567890,
    lat: 12.34567890123,
    timestamp_added: '2021-05-11T21:01:17.000000Z',
    status: {
      timestamp: '2021-07-13T05:31:11.562000Z',
      online: 'online',
      listen_addrs: [
        '/ip4/12.345.678.901/tcp/57449',
      ],
      height: 123456,
    },
    reward_scale: 1,
    owner: 'mock-owner',
    payer: 'mock-payer',
    nonce: 1,
    name: 'mock-name',
    location: 'mock-location',
    location_hex: 'mock-location-hex',
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
    mode: 'full',
    block_added: 123456,
    block: 123456,
    address: 'mock-address',
  })
  expect(hotspot.address).toBe('mock-address')
  expect(hotspot.owner).toBe('mock-owner')
  expect(hotspot.payer).toBe('mock-payer')
  expect(hotspot.speculativeNonce).toBe(2)
  expect(hotspot.nonce).toBe(1)
  expect(hotspot.rewardScale).toBe(1)
  expect(hotspot.geocode?.longCity).toBe('mock-long-city')
  expect(hotspot.blockAdded).toBe(123456)
  expect(hotspot.locationHex).toBe('mock-location-hex')
  expect(hotspot.mode).toBe('full')
  expect(hotspot.status?.timestamp).toBe('2021-07-13T05:31:11.562000Z')
})
