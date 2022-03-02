import {
  bs58CheckEncode,
  bs58KeyType,
  bs58Version,
  bs58PublicKey,
  bs58NetType,
  byteToNetType,
  byteToKeyType,
} from './utils'
import { KeyType, SUPPORTED_KEY_TYPES } from './KeyTypes'
import { NetType, SUPPORTED_NET_TYPES } from './NetTypes'

export default class Address {
  public version!: number

  public netType!: NetType

  public keyType!: KeyType

  public publicKey!: Uint8Array

  constructor(version: number, netType: NetType, keyType: KeyType, publicKey: Uint8Array) {
    if (version !== 0) {
      throw new Error('unsupported version')
    }
    if (!SUPPORTED_NET_TYPES.includes(netType)) {
      throw new Error('unsupported net type')
    }
    if (!SUPPORTED_KEY_TYPES.includes(keyType)) {
      throw new Error('unsupported key type')
    }
    this.version = version
    this.netType = netType
    this.keyType = keyType
    this.publicKey = publicKey
  }

  get bin(): Buffer {
    return Buffer.concat([
      // eslint-disable-next-line no-bitwise
      Buffer.from([this.netType | this.keyType]),
      Buffer.from(this.publicKey),
    ])
  }

  get b58(): string {
    return bs58CheckEncode(this.version, this.bin)
  }

  static fromB58(b58: string): Address {
    const version = bs58Version(b58)
    const netType = bs58NetType(b58)
    const keyType = bs58KeyType(b58)
    const publicKey = bs58PublicKey(b58)
    return new Address(version, netType, keyType, publicKey)
  }

  static fromBin(bin: Buffer): Address {
    const version = 0
    const byte = bin[0]
    const netType = byteToNetType(byte)
    const keyType = byteToKeyType(byte)
    const publicKey = bin.slice(1, bin.length)
    return new Address(version, netType, keyType, publicKey)
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
