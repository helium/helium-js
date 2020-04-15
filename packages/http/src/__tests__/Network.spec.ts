import { Network } from '../'

describe('production', () => {
  it('returns the production network', () => {
    const network = Network.production
    expect(network.endpoint).toBe('https://api.helium.io/v1')
    expect(network.version).toBe(1)
  })
})

describe('staging', () => {
  it('returns the staging network', () => {
    const network = Network.staging
    expect(network.endpoint).toBe('https://api.helium.wtf/v1')
    expect(network.version).toBe(1)
  })
})
