import Address, { KeyTypes } from '@helium/address'

export default class KeySignature {
  public index!: number

  public signature!: Uint8Array

  constructor(index: number, signature: Uint8Array) {
    this.index = index
    this.signature = signature
  }

  public static new(addresses: Address[], address: Address, signature: Uint8Array): KeySignature {
    if (address.keyType === KeyTypes.MULTISIG_KEY_TYPE) {
      throw new Error('invalid keytype for multisig KeySignature')
    }
    return new KeySignature(
      addresses.findIndex((addr) => addr.publicKey === address.publicKey), signature,
    )
  }

  get bin(): Uint8Array {
    return new Uint8Array([this.index, this.signature.length, ...this.signature])
  }
}
