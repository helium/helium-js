import Address, { MultisigAddress } from '@helium/address'
import { sortAddresses } from '@helium/address/build/utils'
import { verifySignature } from './utils'
import KeySignature from './KeySignature'

const PUBLIC_KEY_LENGTH = 33

export default class MultisigSignature {
  public addresses!: Address[]

  public signatures!: KeySignature[]

  constructor(addresses: Address[], signatures: KeySignature[]) {
    this.addresses = addresses
    this.signatures = signatures
  }

  public static create(
    multisigAddress: MultisigAddress, addresses: Address[], signatures: Map<Address, Uint8Array>,
  ): MultisigSignature {
    if (multisigAddress.M > signatures.size) {
      throw new Error('insufficient signatures')
    }
    if (multisigAddress.N !== addresses.length) {
      throw new Error('wrong number of addresses')
    }
    const keySignatures: KeySignature[] = []
    const sortedAddresses = sortAddresses(addresses)
    for (const [address, signature] of signatures) {
      const keySignature = KeySignature.new(sortedAddresses, address, signature)
      keySignatures.push(keySignature)
    }
    return new MultisigSignature(sortedAddresses, keySignatures)
  }

  public verify(message: Uint8Array): number {
    let validSignatureCount = 0
    for (const sig of this.signatures) {
      const address = this.addresses[sig.index]
      if (verifySignature(sig.signature, message, address.publicKey)) {
        validSignatureCount += 1
      }
    }
    return validSignatureCount
  }

  public get bin(): Uint8Array {
    return new Uint8Array([...this.serializedAddresses(), ...this.serlializedSignatures()])
  }

  public static fromBin(multisigAddress: MultisigAddress, input: Uint8Array): MultisigSignature {
    const addresses = this.addressesFromBin(multisigAddress.N, input)
    const signatures = this.signaturesFromBin(
      addresses, input.slice(PUBLIC_KEY_LENGTH * multisigAddress.N),
    )
    return MultisigSignature.create(multisigAddress, addresses, signatures)
  }

  static isValid(multisigAddress: MultisigAddress, input: Uint8Array): boolean {
    try {
      MultisigSignature.fromBin(multisigAddress, input)
      return true
    } catch (error) {
      return false
    }
  }

  private serializedAddresses() {
    let multisigPubKeysBin = new Uint8Array()
    for (const address of this.addresses) {
      multisigPubKeysBin = new Uint8Array([...multisigPubKeysBin, ...address.bin])
    }
    return multisigPubKeysBin
  }

  private serlializedSignatures() {
    let multisigSignatures = new Uint8Array()
    // Ensure signatures are sorted prior to serialization
    for (const sig of this.signatures.sort((a, b) => (a.bin > b.bin ? 1 : -1))) {
      multisigSignatures = new Uint8Array([...multisigSignatures, ...sig.bin])
    }
    return multisigSignatures
  }

  private static addressesFromBin(N: number, input: Uint8Array): Address[] {
    const addresses : Address[] = []
    for (let i = 0; i < N; i += 1) {
      const address = Address.fromBin(Buffer.from(input.slice(0, PUBLIC_KEY_LENGTH)))
      input = input.slice(PUBLIC_KEY_LENGTH)
      addresses.push(address)
    }
    return addresses
  }

  private static signaturesFromBin(
    addresses: Address[], input: Uint8Array,
  ): Map<Address, Uint8Array> {
    const signatures = new Map<Address, Uint8Array>()
    do {
      signatures.set(addresses[input[0]], input.slice(2, input[1] + 2))
      input = input.slice(input[1] + 2)
    } while (input.length)
    return signatures
  }
}
