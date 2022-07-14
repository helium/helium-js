import Address, { MultisigAddress, utils } from '@helium/address'
import { verify as verifySignature } from './utils'
import KeySignature from './KeySignature'

const PUBLIC_KEY_LENGTH = 33

export default class MultisigSignature {
  public addresses!: Address[]

  public signatures!: KeySignature[]

  constructor(addresses: Address[], signatures: KeySignature[]) {
    this.addresses = utils.sortAddresses(addresses)
    this.signatures = signatures
  }

  public async isValid(address: MultisigAddress): Promise<boolean> {
    if (address.M > this.signatures.length) {
      return false
    }
    if (address.N !== this.addresses.length) {
      return false
    }
    const thisAddress = await MultisigAddress.create(this.addresses, address.M, address.netType)
    if (thisAddress.publicKey !== address.publicKey) {
      return false
    }
    return true
  }

  public async verify(message: string | Uint8Array): Promise<number> {
    const verifiedSignatures = await Promise.all(
      this.signatures.map((sig) => verifySignature(
        sig.signature, message, this.addresses[sig.index].publicKey,
      )),
    )
    return verifiedSignatures.filter((isVerified) => isVerified === true).length
  }

  public get bin(): Uint8Array {
    return new Uint8Array([...this.serializedAddresses(), ...this.serlializedSignatures()])
  }

  public static fromBin(multisigAddress: MultisigAddress, input: Uint8Array): MultisigSignature {
    const addresses = this.addressesFromBin(multisigAddress.N, input)
    const signatures = this.signaturesFromBin(input.slice(PUBLIC_KEY_LENGTH * multisigAddress.N))
    return new MultisigSignature(addresses, signatures)
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
      (acc, curVal) => new Uint8Array([...acc, ...curVal.bin]),
      new Uint8Array(),
    )
  }

  private serlializedSignatures() {
    return this.signatures
      .sort((a, b) => (a.bin > b.bin ? 1 : -1))
      .reduce((acc, curVal) => new Uint8Array([...acc, ...curVal.bin]), new Uint8Array())
  }

  private static addressesFromBin(N: number, input: Uint8Array): Address[] {
    return Array(N)
      .fill(null)
      .map((_, i) => Address.fromBin(
        Buffer.from(input.slice(PUBLIC_KEY_LENGTH * i, PUBLIC_KEY_LENGTH * (i + 1))),
      ))
  }

  private static signaturesFromBin(input: Uint8Array): KeySignature[] {
    let index = 0
    const signatureList: KeySignature[] = []
    do {
      const addressIndex = input[index]
      const start = index + 2
      const end = start + input[index + 1]
      signatureList.push(new KeySignature(addressIndex, input.slice(start, end)))
      index += input[index + 1] + 2
    } while (index < input.length)
    return signatureList
  }

  async sign(message: string | Uint8Array): Promise<Uint8Array> {
    if (await this.verify(message) < 1) {
      throw new Error('no valid signatures for message')
    }
    return this.bin
  }
}
