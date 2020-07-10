import sodium from 'libsodium-wrappers'
import type { KeyPair as SodiumKeyPair } from 'libsodium-wrappers'
import Mnemonic from './Mnemonic'
import Address from './Address'
import { ED25519_KEY_TYPE } from './KeyType'


// extend SodiumKeyPair?
export default class Keypair {
  public keypair!: SodiumKeyPair
  public publicKey!: Uint8Array
  public privateKey!: Uint8Array
  public keyType!: string

  constructor(keypair: SodiumKeyPair) {
    this.keypair = keypair
    this.publicKey = keypair.publicKey
    this.privateKey = keypair.privateKey
    this.keyType = keypair.keyType
  }

  get address(): Address {
    return new Address(0, ED25519_KEY_TYPE, this.publicKey)
  }

  static async makeRandom(): Promise<Keypair> {
    await sodium.ready
    const keypair = sodium.crypto_sign_keypair()
    return new Keypair(keypair)
  }

  static async fromWords(words: Array<string>): Promise<Keypair> {
    const mnenomic = new Mnemonic(words)
    const keypair = await this.fromMnemonic(mnenomic)
    return keypair
  }

  static async fromMnemonic(mnenomic: Mnemonic): Promise<Keypair> {
    await sodium.ready
    const entropy = mnenomic.toEntropy()
    const seed = Buffer.concat([entropy, entropy])

    return Keypair.fromEntropy(seed)
  }

  static async fromEntropy(entropy: Uint8Array | Buffer): Promise<Keypair> {
    await sodium.ready
    const entropyBuffer = Buffer.from(entropy)
    if (Buffer.byteLength(entropyBuffer) !== 32) throw new Error('Invalid entropy, must be 32 bytes')
    const keypair = sodium.crypto_sign_seed_keypair(entropy)
    return new Keypair(keypair)
  }

  async sign(message: string | Uint8Array): Promise<Uint8Array> {
    await sodium.ready
    const signature = sodium.crypto_sign_detached(message, this.privateKey)
    return signature
  }
}
