import { bs58CheckEncode, bs58KeyType, bs58Version, bs58PublicKey } from './utils'
import { KeyType, SUPPORTED_KEY_TYPES } from './KeyType'

export default class Address {
  public version!: number
  public keyType!: KeyType
  public publicKey!: Uint8Array

  constructor(version: number, keyType: KeyType, publicKey: Uint8Array) {
    if (!SUPPORTED_KEY_TYPES.includes(keyType)) {
      throw new Error('unsupported key type')
    }
    if (version !== 0) {
      throw new Error('unsupported version')
    }
    this.version = version
    this.keyType = keyType
    this.publicKey = publicKey
  }

  get bin(): Buffer {
    return Buffer.concat([
      Buffer.from([this.keyType]),
      Buffer.from(this.publicKey),
    ])
  }

  get b58(): string {
    return bs58CheckEncode(this.version, this.bin)
  }

  static fromB58(b58: string): Address {
    const version = bs58Version(b58)
    const keyType = bs58KeyType(b58)
    const publicKey = bs58PublicKey(b58)
    return new Address(version, keyType, publicKey)
  }

  static fromBin(bin: Buffer): Address {
    const version = 0
    const keyType = bin[0]
    const publicKey = bin.slice(1, bin.length)
    return new Address(version, keyType, publicKey)
  }

  static isValid(b58: string): boolean {
    try {
      Address.fromB58(b58)
      return true
    } catch (error) {
      return false
    }
  }
}
