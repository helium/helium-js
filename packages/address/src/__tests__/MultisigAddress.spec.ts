import Address from '..'
import MultisigAddress from '../MultisigAddress'
import {
  bobB58,
  aliceB58,
  bobAliceMultisig1of2B58,
  bobAliceMultisig2of2B58,
  testnetBobAliceMultisig2of2B58,
} from '../../../../integration_tests/fixtures/users'
import { TESTNET } from '../NetTypes'

describe('multisig b58', () => {
  it('returns a b58 check encoded representation of a multisig address', async () => {
    const addressMultisig2of2 = await MultisigAddress.create(
      [Address.fromB58(bobB58), Address.fromB58(aliceB58)], 2,
    )
    expect(addressMultisig2of2.b58).toBe(bobAliceMultisig2of2B58)
  })

  it('supports multisig addresses', () => {
    const addressMultisig2of2 = MultisigAddress.fromB58(bobAliceMultisig2of2B58)
    expect(addressMultisig2of2.b58).toBe(bobAliceMultisig2of2B58)
  })
})

describe('bin', () => {
  it('returns a binary representation of the multisig ddress', async () => {
    const addressMultisig2of2 = await MultisigAddress.create(
      [Address.fromB58(bobB58), Address.fromB58(aliceB58)], 2,
    )
    expect(addressMultisig2of2.bin[0]).toBe(2)
  })
})

describe('fromBin', () => {
  it('builds a MultisigAddress from a binary representation', async () => {
    const multisigAddress = await MultisigAddress.create(
      [Address.fromB58(bobB58), Address.fromB58(aliceB58)], 2,
    )
    const multisigAddressFromBin = MultisigAddress.fromBin(multisigAddress.bin)
    expect(multisigAddressFromBin.b58).toBe(multisigAddress.b58)
  })
})

describe('fromB58', () => {
  it('builds an Address from a b58 string', () => {
    const multisigAddressFromB58 = Address.fromB58(bobAliceMultisig2of2B58)
    expect(multisigAddressFromB58.b58).toBe(bobAliceMultisig2of2B58)
  })
})

describe('unsupported child key types', () => {
  it('throws an error if creating address with multisig key type', async () => {
    expect(async () => {
      await MultisigAddress.create(
        [MultisigAddress.fromB58(bobAliceMultisig2of2B58), Address.fromB58(aliceB58)], 2,
      )
    }).rejects.toThrow()
  })
})

describe('isValid', () => {
  it('returns true if the address is valid and supported', () => {
    expect(MultisigAddress.isValid(bobAliceMultisig2of2B58)).toBeTruthy()
    expect(MultisigAddress.isValid(bobAliceMultisig1of2B58)).toBeTruthy()
  })
})

describe('testnet addresses', () => {
  it('decodes testnet addresses from b58', async () => {
    const address = MultisigAddress.fromB58(testnetBobAliceMultisig2of2B58)
    expect(address.netType).toBe(TESTNET)
  })
})

describe('testnet addresses', () => {
  it('decodes testnet addresses from b58', async () => {
    const address = MultisigAddress.fromB58(testnetBobAliceMultisig2of2B58)
    expect(address.netType).toBe(TESTNET)
  })
})

describe('erlang interop', () => {
  it('makes the same multisig key as the erlang lib ', async () => {
    const keys = [
      Address.fromB58('11MJXxoWFp2bMsqKM6QZin6ync9DQ3fjjFjUrFiRCaKunmBEBhK'),
      Address.fromB58('11x7jP9yAnyk5jeYywmsYDFdYq5xvKLKjP2zjhGzCwDSQtxcUDt'),
    ]
    const address = await MultisigAddress.create(keys, 1)
    expect(address.b58).toBe('1SVRdbaAev7zSpUsMjvQrbRBGFHLXEa63SGntYCqChC4CTpqwftTPGbZ')
  })
})
