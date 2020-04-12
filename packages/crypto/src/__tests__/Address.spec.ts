import Address from '../Address'
import { usersFixture, bobB58 } from '../../../../integration_tests/fixtures/users'

describe('b58', () => {
  it('returns a b58 check encoded representation of the address', async () => {
    const { bob } = await usersFixture()
    const address = new Address(bob.publicKey)
    expect(address.b58).toBe(bobB58)
  })
})

describe('bin', () => {
  it('returns a binary representation of the address', async () => {
    const { bob } = await usersFixture()
    const address = new Address(bob.publicKey)
    expect(address.bin[0]).toBe(1)
  })
})

describe('fromB58', () => {
  it('builds an Address from a b58 string', () => {
    const address = Address.fromB58(bobB58)
    expect(address.b58).toBe(bobB58)
  })
})
