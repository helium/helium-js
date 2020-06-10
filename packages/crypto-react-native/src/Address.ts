import { bs58CheckEncode, bs58ToBin } from './utils'

export default class Address {
  public publicKey!: string

  constructor(publicKey: string) {
    this.publicKey = publicKey
  }

  get bin(): Buffer {
    return Buffer.concat([
      Buffer.from([1]),
      Buffer.from(this.publicKey),
    ])
  }

  get b58(): string {
    return bs58CheckEncode(0, this.bin)
  }

  static fromB58(b58: string): Address {
    const bin = bs58ToBin(b58)
    return Address.fromBin(bin)
  }

  static fromBin(bin: Uint8Array): Address {
    return new Address(Buffer.from(bin).slice(1).toString())
  }
}
