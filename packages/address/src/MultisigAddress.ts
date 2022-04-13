import { sha256 } from 'multiformats/hashes/sha2'
import {
  bs58M,
  bs58N,
  bs58Version,
  bs58MultisigPublicKey,
  bs58NetType,
  byteToNetType,
  byteToKeyType,
  sortAddresses,
  bs58KeyType,
} from './utils'
import { MULTISIG_KEY_TYPE } from './KeyTypes'
import { NetType, MAINNET } from './NetTypes'
import Address from './Address'

export default class MultisigAddress extends Address {
  public M!: number

  public N!: number

  public constructor(
    version: number, netType: NetType, M: number, N: number, publicKey: Uint8Array,
  ) {
    if (M > 256) {
      throw new Error('required signers cannot exceed 256')
    }
    if (N > 256) {
      throw new Error('total signers cannot exceed 256')
    }
    if (M > N) {
      throw new Error('required signers cannot exceed total signers')
    }
    super(version, netType, MULTISIG_KEY_TYPE, publicKey)
    this.M = M
    this.N = N
  }

  get bin(): Buffer {
    return Buffer.concat([
      // eslint-disable-next-line no-bitwise
      Buffer.from([this.netType | this.keyType]),
      Buffer.from(new Uint8Array([this.M])),
      Buffer.from(new Uint8Array([this.N])),
      Buffer.from(this.publicKey),
    ])
  }

  static fromB58(b58: string): MultisigAddress {
    const keyType = bs58KeyType(b58)
    if (keyType !== MULTISIG_KEY_TYPE) {
      throw new Error('invalid keytype for multisig address')
    }
    const version = bs58Version(b58)
    const netType = bs58NetType(b58)
    const M = bs58M(b58)
    const N = bs58N(b58)
    const publicKey = bs58MultisigPublicKey(b58)
    return new MultisigAddress(version, netType, M, N, publicKey)
  }

  static fromBin(bin: Buffer): MultisigAddress {
    const version = 0
    const byte = bin[0]
    const netType = byteToNetType(byte)
    const keyType = byteToKeyType(byte)
    if (keyType !== MULTISIG_KEY_TYPE) {
      throw new Error('invalid keytype for multisig address')
    }
    const M = bin[1]
    const N = bin[2]
    const publicKey = bin.slice(3, bin.length)
    return new MultisigAddress(version, netType, M, N, publicKey)
  }

  public static async create(
    addresses: Address[], M: number, netType?: NetType,
  ): Promise<MultisigAddress> {
    if (addresses.some((addr) => addr.keyType === MULTISIG_KEY_TYPE)) {
      return Promise.reject(new Error('cannot create multisig with invalid child keytype'))
    }
    const version = 0
    const multisigPubKeysBin = sortAddresses(addresses).map((address) => address.bin)
    const publicKey = (await sha256.digest(multisigPubKeysBin.reduce(
      (acc, curVal) => new Uint8Array([...acc, ...curVal]), new Uint8Array(),
    )))
    return new MultisigAddress(version, netType || MAINNET, M, addresses.length, publicKey.bytes)
  }

  static isValid(b58: string): boolean {
    try {
      MultisigAddress.fromB58(b58)
      return true
    } catch (error) {
      return false
    }
  }
}
