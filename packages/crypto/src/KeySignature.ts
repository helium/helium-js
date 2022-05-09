import Address, { KeyTypes, utils } from '@helium/address'

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
      utils.sortAddresses(addresses).findIndex((addr) => addr.publicKey === address.publicKey),
      signature,
    )
  }

  public static fromMap(
    addresses: Address[],
    signatureMap: Map<Address, Uint8Array>,
  ): KeySignature[] {
    return Array.from(signatureMap).map((value) => KeySignature.new(addresses, value[0], value[1]))
  }

  get bin(): Uint8Array {
    return new Uint8Array([this.index, this.signature.length, ...this.signature])
  }
}
