import Address from '..'
import { usersFixture, bobB58 } from '../../../../integration_tests/fixtures/users'
import { ED25519_KEY_TYPE } from '../KeyTypes'
import { MAINNET, TESTNET } from '../NetTypes'

const ECC_COMPACT_ADDRESS = '112qB3YaH5bZkCnKA5uRH7tBtGNv2Y5B4smv1jsmvGUzgKT71QpE'
const BTC_ADDRESS = '18wxa7qM8C8AXmGwJj13C7sGqn8hyFdcdR'
const TESTNET_ADDRESS = '1bijtibPhc16wx4oJbyK8vtkAgdoRoaUvJeo7rXBnBCufEYakfd'

describe('b58', () => {
  it('returns a b58 check encoded representation of the address', async () => {
    const { bob } = await usersFixture()
    const address = new Address(0, MAINNET, ED25519_KEY_TYPE, bob.publicKey)
    expect(address.b58).toBe(bobB58)
  })

  it('supports ed25519 addresses', () => {
    const address = Address.fromB58(bobB58)
    expect(address.b58).toBe(bobB58)
  })

  it('supports ecc_compact addresses', () => {
    const address = Address.fromB58(ECC_COMPACT_ADDRESS)
    expect(address.b58).toBe(ECC_COMPACT_ADDRESS)
  })
})

describe('bin', () => {
  it('returns a binary representation of the address', async () => {
    const { bob } = await usersFixture()
    const address = new Address(0, MAINNET, ED25519_KEY_TYPE, bob.publicKey)
    expect(address.bin[0]).toBe(1)
  })
})

describe('fromBin', () => {
  it('builds an Address from a binary representation', async () => {
    const { bob } = await usersFixture()
    const { bin } = new Address(0, MAINNET, ED25519_KEY_TYPE, bob.publicKey)
    const address = Address.fromBin(bin)
    expect(address.b58).toBe(bob.address.b58)
  })
})

describe('fromB58', () => {
  it('builds an Address from a b58 string', () => {
    const address = Address.fromB58(bobB58)
    expect(address.b58).toBe(bobB58)
  })
})

describe('unsupported key types', () => {
  it('throws an error if given an unsupported key type via B58', async () => {
    expect(() => {
      Address.fromB58(BTC_ADDRESS)
    }).toThrow()
  })

  it('throws an error if initialized with an unsupported key type', async () => {
    expect(() => new Address(0, MAINNET, 57, Buffer.from('some random public key')))
      .toThrow()
  })
})

describe('isValid', () => {
  it('returns true if the address is valid and supported', () => {
    expect(Address.isValid(bobB58)).toBeTruthy()
    expect(Address.isValid(ECC_COMPACT_ADDRESS)).toBeTruthy()
  })

  it('returns false if the address is not valid', () => {
    expect(Address.isValid('some bad address')).toBeFalsy()
  })

  it('returns false if the check decode fails', () => {
    const badBobB58 = '13M8dUbxymE3xtiAXszRkGMmezMhBS8Li7wEsMojLdb4Sdxc4wb'
    expect(Address.isValid(badBobB58)).toBeFalsy()
  })

  it('returns false if the key type is unsupported', () => {
    expect(Address.isValid(BTC_ADDRESS)).toBeFalsy()
  })
})

describe('unsupported versions', () => {
  it('throws an error if b58 check encoded version is not 0', async () => {
    const { bob } = await usersFixture()
    expect(() => new Address(1, MAINNET, ED25519_KEY_TYPE, bob.publicKey)).toThrow()
  })
})

describe('testnet addresses', () => {
  it('decodes testnet addresses from b58', async () => {
    const address = Address.fromB58(TESTNET_ADDRESS)
    expect(address.netType).toBe(TESTNET)
  })
})
