import {
  bs58M,
  bs58N,
  bs58Version,
  bs58PublicKey,
  bs58NetType,
  byteToNetType,
  sortAddresses,
} from './utils'
import { sha256 } from 'multiformats/hashes/sha2'
import { MULTISIG_KEY_TYPE } from './KeyType'
import { NetType, MAINNET} from './NetType'
import Address from './Address'

export default class MultisigAddress extends Address {
  public M!: number

  public N!: number

  constructor(version: number, netType: NetType, M: number, N: number, publicKey: Uint8Array) {
    super(version, netType, MULTISIG_KEY_TYPE, publicKey);
    if (M > 256) {
      throw new Error('required signers cannot exceed 256')
    }
    if (N > 256) {
      throw new Error('total signers cannot exceed 256')
    }
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
    const version = bs58Version(b58)
    const netType = bs58NetType(b58)
    const M = bs58M(b58)
    const N = bs58N(b58)
    const publicKey = bs58PublicKey(b58)
    return new MultisigAddress(version, netType, M, N, publicKey)
  }

  static fromBin(bin: Buffer): MultisigAddress {
    const version = 0
    const byte = bin[0]
    const netType = byteToNetType(byte)
    const M = bin[1]
    const N = bin[2]
    const publicKey = bin.slice(3, bin.length)
    return new MultisigAddress(version, netType, M, N, publicKey)
  }

  static async create(addresses: Address[], M: number, N: number, netType?: NetType): Promise<MultisigAddress> {
    const version = 0
    if (!netType) {
      netType = MAINNET
    }

    let multisigPubKeysBin = new Uint8Array()
    sortAddresses(addresses).forEach((address) => {
      multisigPubKeysBin = new Uint8Array([...multisigPubKeysBin, ...address.bin])
    })

    const publicKey = (await sha256.digest(multisigPubKeysBin))
    return new MultisigAddress(version, netType, M, N, publicKey.bytes)
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
