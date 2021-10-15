import { Mnemonic } from '..'
import { randomBytes } from '../utils'
import { bobWords } from '../../../../integration_tests/fixtures/users'

describe('Mnemonic', () => {
  it('is initialized with a list of words', () => {
    const mnemonic = new Mnemonic(bobWords)
    expect(mnemonic.words).toEqual(bobWords)
  })
})

describe('create', () => {
  it('creates a new mnemonic with 12 words by default', async () => {
    const mnemonic = await Mnemonic.create()
    expect(mnemonic.words.length).toBe(12)
  })

  it('can create a new mnemonic with 24 words', async () => {
    const mnemonic = await Mnemonic.create(24)
    expect(mnemonic.words.length).toBe(24)
  })
})

describe('fromEntropy', () => {
  it('creates a new mnemonic from given entropy', async () => {
    const entropy = await randomBytes(16)
    const mnemonic = Mnemonic.fromEntropy(entropy)
    expect(mnemonic.words.length).toBe(12)
  })

  it('creates a new 24-word mnemonic from given entropy', async () => {
    const entropy = await randomBytes(32)
    const mnemonic = Mnemonic.fromEntropy(entropy)
    expect(mnemonic.words.length).toBe(24)
  })

  it('should generate bip39 checksum word', async () => {
    // https://github.com/bitcoinjs/bip39/blob/master/test/vectors.json
    const entropy = Buffer.from('00000000000000000000000000000000', 'hex')
    const mnemonic = Mnemonic.fromEntropy(entropy)
    expect(mnemonic.words[11]).toBe('about')
  })

  it('throws an error if entropy is less than 16 bytes', async () => {
    const entropy = await randomBytes(12)
    expect(() => {
      Mnemonic.fromEntropy(entropy)
    }).toThrow()
  })

  it('throws an error if entropy is greater than 32 bytes', async () => {
    const entropy = await randomBytes(40)
    expect(() => {
      Mnemonic.fromEntropy(entropy)
    }).toThrow()
  })

  it('throws an error if entropy bytes are not divisible by 4', async () => {
    const entropy = await randomBytes(17)
    expect(() => {
      Mnemonic.fromEntropy(entropy)
    }).toThrow()
  })
})

describe('toEntropy', () => {
  it('returns the entropy originally used to derive the mnemonic', async () => {
    const entropy = await randomBytes(16)
    const mnemonic = Mnemonic.fromEntropy(entropy)
    expect(mnemonic.toEntropy()).toEqual(entropy)
  })

  it('returns the entropy originally used to derive a 24-word mnemonic', async () => {
    const entropy = await randomBytes(32)
    const mnemonic = Mnemonic.fromEntropy(entropy)
    expect(mnemonic.toEntropy()).toEqual(entropy)
  })
})
