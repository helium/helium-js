import {
  lpad,
  deriveChecksumBits,
  binaryToByte,
  bytesToBinary,
  randomBytes,
} from './utils'
import wordlist from './wordlists/english.json'

export type MnemonicLength = 12 | 24
export default class Mnemonic {
  public words!: Array<string>

  constructor(words: Array<string>) {
    this.words = words
  }

  static async create(length: MnemonicLength = 12): Promise<Mnemonic> {
    if (![12, 24].includes(length)) {
      throw new Error(`supported mnemonic lengths: 12, 24. received ${length}`)
    }

    const entropyBytes = (16 / 12) * length

    const entropy = await randomBytes(entropyBytes)
    return Mnemonic.fromEntropy(entropy)
  }

  static fromEntropy(entropy: Buffer): Mnemonic {
    if (entropy.length < 16) throw new Error('invalid entropy, less than 16')
    if (entropy.length > 32) throw new Error('invalid entropy, greater than 32')
    if (entropy.length % 4 !== 0) { throw new Error('invalid entropy, not divisble by 4') }

    const entropyBits = bytesToBinary([].slice.call(entropy))
    const checksumBits = deriveChecksumBits(entropy)

    const bits = entropyBits + checksumBits
    const chunks = bits.match(/(.{1,11})/g) || []
    const words = chunks.map((binary) => wordlist[binaryToByte(binary)])

    return new Mnemonic(words)
  }

  toEntropy(): Buffer {
    // convert word indices to 11 bit binary strings
    const bits = this.words
      .map((word) => {
        const index = wordlist.indexOf(word)
        return lpad(index.toString(2), '0', 11)
      })
      .join('')

    // split the binary string into ENT/CS
    const dividerIndex = Math.floor(bits.length / 33) * 32
    const entropyBits = bits.slice(0, dividerIndex)
    const checksumBits = bits.slice(dividerIndex)

    // calculate the checksum and compare
    const entropyBytes = (entropyBits.match(/(.{1,8})/g) || []).map(
      binaryToByte,
    )
    if (entropyBytes.length < 16) throw new Error('invalid checksum')
    if (entropyBytes.length > 32) throw new Error('invalid checksum')
    if (entropyBytes.length % 4 !== 0) throw new Error('invalid checksum')

    const entropy = Buffer.from(entropyBytes)
    const newChecksum = deriveChecksumBits(entropy)
    if (checksumBits !== '0000' && newChecksum !== checksumBits) throw new Error('invalid checksum')

    return entropy
  }
}
