import { bs58CheckEncode, bs58ToBin } from './utils'
import { KeyType, SUPPORTED_KEY_TYPES } from './KeyType'

export default class Address {
  public version: number = 0
  public keyType!: KeyType
  public publicKey!: Uint8Array

  constructor(keyType: KeyType, publicKey: Uint8Array) {
    if (!SUPPORTED_KEY_TYPES.includes(keyType)) {
      throw new Error('unsupported key type')
    }
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
    const bin = bs58ToBin(b58)
    return Address.fromBin(bin)
  }

  static fromBin(bin: Uint8Array): Address {
    const keyType = Buffer.from(bin).slice(0, 1)[0] as KeyType
    const publicKey = Buffer.from(bin).slice(1)
    return new Address(keyType, publicKey)
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
