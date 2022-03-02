import { NetTypes, utils } from '@helium/address'
import { Keypair, Mnemonic } from '..'
import { bobWords, bobBip39Words, bobB58 } from '../../../../integration_tests/fixtures/users'

describe('makeRandom', () => {
  it('makes a new random keypair', async () => {
    const keypair = await Keypair.makeRandom()
    expect(keypair.keyType).toBe('ed25519')
  })
})

describe('publicKey', () => {
  it('returns the public key', async () => {
    const keypair = await Keypair.makeRandom()
    expect(keypair.publicKey.length).toBe(32)
  })
})

describe('privateKey', () => {
  it('returns the private key', async () => {
    const keypair = await Keypair.makeRandom()
    expect(keypair.privateKey.length).toBe(64)
  })
})

describe('keyType', () => {
  it('returns the key type', async () => {
    const keypair = await Keypair.makeRandom()
    expect(keypair.keyType).toBe('ed25519')
  })
})

describe('address', () => {
  it('returns an Address derived from the public key', async () => {
    const account = await Keypair.fromWords(bobWords)
    expect(account.address.b58).toBe(bobB58)
  })
})

describe('fromWords', () => {
  it('returns the same keypair using both bip39 and legacy checksum words', async () => {
    const legacy = await Keypair.fromWords(bobWords)
    const bip39 = await Keypair.fromWords(bobBip39Words)
    expect(legacy).toStrictEqual(bip39)
  })
})

describe('fromEntropy', () => {
  it('returns a keypair seeded by provided entropy', async () => {
    const entropy = '1f5b981baca0420259ab53996df7a8ce0e3549c6616854e7dff796304bafb6bf'
    const keypair = await Keypair.fromEntropy(Buffer.from(entropy, 'hex'))
    expect(keypair.keyType).toBe('ed25519')
  })

  it('throws an error if the provided entropy is not 32 bytes', async () => {
    const entropy = 'e8e0b9e9badae50f230e9ec12f213fd9'
    const makeKeypair = async () => {
      await Keypair.fromEntropy(Buffer.from(entropy, 'hex'))
    }
    await expect(makeKeypair()).rejects.toThrow()
  })
})

describe('sign', () => {
  it('signs a message using the private key', async () => {
    const mnemonic = new Mnemonic(bobWords)
    const keypair = await Keypair.fromMnemonic(mnemonic)
    const message = 'the shark feeds at midnight'
    const signature = await keypair.sign(message)
    const expectedSignature = 'NKGpxhYtcXdyFDDRbbY5KjY7r38R8q1ViBft85t4QcH/WrB2Mg9bg2RocfYy16YGcxjLLNSwTLOmfxsjwPWdBQ=='
    expect(Buffer.from(signature).toString('base64')).toBe(expectedSignature)
  })
})

describe('testnet keypairs', () => {
  it('can make a testnet keypair from entropy', async () => {
    const entropy = Buffer.from(
      '1f5b981baca0420259ab53996df7a8ce0e3549c6616854e7dff796304bafb6bf',
      'hex',
    )
    const keypair = await Keypair.fromEntropy(entropy, NetTypes.TESTNET)
    expect(keypair.address.netType).toBe(NetTypes.TESTNET)
    expect(utils.bs58NetType(keypair.address.b58)).toBe(NetTypes.TESTNET)
  })
})
