import sodium from 'libsodium-wrappers'
import type { KeyPair as SodiumKeyPair } from 'libsodium-wrappers'
import Address, { KeyTypes, NetTypes } from '@helium/address'
import Mnemonic from './Mnemonic'

const { ED25519_KEY_TYPE } = KeyTypes
const { MAINNET } = NetTypes

type NetType = NetTypes.NetType

// extend SodiumKeyPair?
export default class Keypair {
  public keypair!: SodiumKeyPair

  public publicKey!: Uint8Array

  public privateKey!: Uint8Array

  public keyType!: string

  public netType!: NetType

  constructor(keypair: SodiumKeyPair, netType?: NetType) {
    this.keypair = keypair
    this.publicKey = keypair.publicKey
    this.privateKey = keypair.privateKey
    this.keyType = keypair.keyType
    this.netType = netType || MAINNET
  }

  get address(): Address {
    return new Address(0, this.netType, ED25519_KEY_TYPE, this.publicKey)
  }

  static async makeRandom(netType?: NetType): Promise<Keypair> {
    await sodium.ready
    const keypair = sodium.crypto_sign_keypair()
    return new Keypair(keypair, netType)
  }

  static async fromWords(words: Array<string>, netType?: NetType): Promise<Keypair> {
    const mnenomic = new Mnemonic(words)
    const keypair = await this.fromMnemonic(mnenomic, netType)
    return keypair
  }

  static async fromMnemonic(mnenomic: Mnemonic, netType?: NetType): Promise<Keypair> {
    await sodium.ready
    const entropy = mnenomic.toEntropy()
    const seed = entropy.length === 16 ? Buffer.concat([entropy, entropy]) : entropy

    return Keypair.fromEntropy(seed, netType)
  }

  static async fromEntropy(entropy: Uint8Array | Buffer, netType?: NetType): Promise<Keypair> {
    await sodium.ready
    const entropyBuffer = Buffer.from(entropy)
    if (Buffer.byteLength(entropyBuffer) !== 32) throw new Error('Invalid entropy, must be 32 bytes')
    const keypair = sodium.crypto_sign_seed_keypair(entropy)
    return new Keypair(keypair, netType)
  }

  async sign(message: string | Uint8Array): Promise<Uint8Array> {
    await sodium.ready
    const signature = sodium.crypto_sign_detached(message, this.privateKey)
    return signature
  }
}
