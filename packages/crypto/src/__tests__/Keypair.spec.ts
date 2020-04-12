import Keypair from '../Keypair'
import Mnemonic from '../Mnemonic'
import { bobWords, bobB58 } from '../../../../integration_tests/fixtures/users'

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
