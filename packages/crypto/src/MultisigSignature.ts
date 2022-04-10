import Address, { KeyTypes, MultisigAddress } from '@helium/address'
import { sortAddresses } from '@helium/address/build/utils';
import { verifySignature } from './utils'
const {MULTISIG_KEY_TYPE} = KeyTypes
const PUBLIC_KEY_LENGTH = 33;


class KeySignature {
  public index!: number

  public signature!: Uint8Array

  constructor(index: number,  signature:  Uint8Array) {
    this.index = index
    this.signature = signature
  }

  public static new(addresses: Address[], address: Address, signature: Uint8Array) {
    if (address.keyType == MULTISIG_KEY_TYPE) {
      throw new Error('invalid keytype for multisig KeySignature')
    }
    return new KeySignature(addresses.findIndex(addr => addr.publicKey === address.publicKey), signature)
  }

  get bin(): Uint8Array {
    return  new Uint8Array([this.index, this.signature.length, ...this.signature])
  }
}

export default class MultisigSignature {
  public addresses!: Address[]

  public signatures!: KeySignature[]

  constructor(addresses: Address[], signatures: KeySignature[]) {
    this.addresses = addresses
    this.signatures = signatures
  }

  public static create(multisigAddress: MultisigAddress, addresses: Address[], signatures: Map<Address, Uint8Array>): MultisigSignature {
    addresses = sortAddresses(addresses)
    if (multisigAddress.M > signatures.size) {
      throw new Error('insufficient signatures')
    } 
    if (multisigAddress.N != addresses.length) {
      throw new Error('wrong number of addresses')
    }
    let keySignatures: KeySignature[] = [];
    for (const [address, signature] of signatures) {
      let keySignature = KeySignature.new(addresses, address, signature)
      keySignatures.push(keySignature)
    }
    return new MultisigSignature(addresses, keySignatures)
  }

  public verify(message: Uint8Array): number {
    let valid_signature_count = 0;
    for (const sig of this.signatures) {
      let address = this.addresses[sig.index];
      if (verifySignature(sig.signature, message, address.publicKey)){
        valid_signature_count += 1
      }
    }
    return valid_signature_count
  }

  get bin(): Uint8Array { 
    return new Uint8Array([...this.serializedAddresses(), ...this.serlializedSignatures()])
  }

  public static fromBin(multisigAddress: MultisigAddress, input: Uint8Array): MultisigSignature {
    let addresses = this.addressesFromBin(multisigAddress.N, input)
    let signatures = this.signaturesFromBin(addresses, input.slice(PUBLIC_KEY_LENGTH * multisigAddress.N))
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
    for (const sig of this.signatures.sort((a, b) => a.bin > b.bin ? 1 : -1)) {
      multisigSignatures = new Uint8Array([...multisigSignatures, ...sig.bin])
    }
    return multisigSignatures
  }
  
  private static addressesFromBin(N: number, input: Uint8Array): Address[] {
    let addresses : Address[] = [];
    for (let i = 0; i < N; i++){
      let address = Address.fromBin(Buffer.from(input.slice(0, PUBLIC_KEY_LENGTH)))
      input = input.slice(PUBLIC_KEY_LENGTH)
      addresses.push(address)
    }
    return addresses
  }
  
  private static signaturesFromBin(addresses: Address[], input: Uint8Array): Map<Address, Uint8Array> {
    let signatures = new Map<Address, Uint8Array>();
    do {
      signatures.set(addresses[input[0]], input.slice(2, input[1] + 2))
      input = input.slice(input[1] + 2)
    } while (input.length);
    return signatures;
  }
}
