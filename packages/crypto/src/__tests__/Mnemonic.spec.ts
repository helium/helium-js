import { Mnemonic } from '..'
import { randomBytes } from '../utils'
import { bobWords } from '../../../../integration_tests/fixtures/users'


describe('Mnemonic', () => {
  it('is initialized with a list of words', () => {
    const mnemonic = new Mnemonic(bobWords)
    expect(mnemonic.words).toEqual(bobWords)
  })
})

describe('fromEntropy', () => {
  it('creates a new mnemonic from given entropy', async () => {
    const entropy = await randomBytes(16)
    const mnemonic = Mnemonic.fromEntropy(entropy)
    expect(mnemonic.words.length).toBe(12)
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
})
