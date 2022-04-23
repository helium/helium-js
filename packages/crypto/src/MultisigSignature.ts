import Address, { MultisigAddress, utils } from '@helium/address'
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
    const sortedAddresses = utils.sortAddresses(addresses)
    const keySignatures = Array.from(signatures).map(
      (value) => KeySignature.new(sortedAddresses, value[0], value[1]),
    )
    return new MultisigSignature(sortedAddresses, keySignatures)
  }

  public verify(message: string | Uint8Array): number {
    return this.signatures.filter(
      (sig) => verifySignature(sig.signature, message, this.addresses[sig.index].publicKey),
    ).length
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

  private serializedAddresses(): Uint8Array {
    return this.addresses.reduce(
      (acc, curVal) => new Uint8Array([...acc, ...curVal.bin]), new Uint8Array(),
    )
  }

  private serlializedSignatures() {
    return this.signatures.sort((a, b) => (a.bin > b.bin ? 1 : -1)).reduce(
      (acc, curVal) => new Uint8Array([...acc, ...curVal.bin]), new Uint8Array(),
    )
  }

  private static addressesFromBin(N: number, input: Uint8Array): Address[] {
    return Array(N).fill(null).map(
      (_, i) => Address.fromBin(
        Buffer.from(input.slice(PUBLIC_KEY_LENGTH * i, PUBLIC_KEY_LENGTH * (i + 1))),
      ),
    )
  }

  private static signaturesFromBin(
    addresses: Address[], input: Uint8Array,
  ): Map<Address, Uint8Array> {
    let indexPointer = 0
    const signatures = new Map<Address, Uint8Array>()
    do {
      signatures.set(
        addresses[input[indexPointer]],
        input.slice(indexPointer + 2, input[indexPointer + 1] + indexPointer + 2),
      )
      indexPointer += input[indexPointer + 1] + 2
    } while (indexPointer < input.length)
    return signatures
  }

  async sign(message: string | Uint8Array): Promise<Uint8Array> {
    if (this.verify(message) < 1) {
      throw new Error('no valid signatures for message')
    }
    return this.bin
  }
}
