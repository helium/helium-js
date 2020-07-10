import Sodium from 'react-native-sodium'
import Mnemonic from './Mnemonic'
import Address from './Address'
import { ED25519_KEY_TYPE } from './KeyType'

interface SodiumKeyPair {
  sk: string
  pk: string
}

// extend SodiumKeyPair?
export default class Keypair {
  public keypair!: SodiumKeyPair
  public publicKey!: Buffer
  public privateKey!: Buffer

  constructor(keypair: SodiumKeyPair) {
    this.keypair = keypair
    this.publicKey = Buffer.from(keypair.pk, 'base64')
    this.privateKey = Buffer.from(keypair.sk, 'base64')
  }

  get address(): Address {
    return new Address(0, ED25519_KEY_TYPE ,this.publicKey)
  }

  static async makeRandom(): Promise<Keypair> {
    const keypair = await Sodium.crypto_sign_keypair()
    return new Keypair(keypair)
  }

  static async fromWords(words: Array<string>): Promise<Keypair> {
    const mnenomic = new Mnemonic(words)
    const keypair = await this.fromMnemonic(mnenomic)
    return keypair
  }

  static async fromMnemonic(mnenomic: Mnemonic): Promise<Keypair> {
    const entropy = mnenomic.toEntropy()
    const seed = Buffer.concat([entropy, entropy])

    return Keypair.fromEntropy(seed)
  }

  static async fromEntropy(entropy: Uint8Array | Buffer): Promise<Keypair> {
    const entropyBuffer = Buffer.from(entropy)
    if (Buffer.byteLength(entropyBuffer) !== 32)
      throw new Error('Invalid entropy, must be 32 bytes')
    const keypair = await Sodium.crypto_sign_seed_keypair(
      entropyBuffer.toString('base64'),
    )
    return new Keypair(keypair)
  }

  async sign(message: string | Uint8Array): Promise<Buffer> {
    const messageBuffer = Buffer.from(message)
    const signature = await Sodium.crypto_sign_detached(
      messageBuffer.toString('base64'),
      this.privateKey.toString('base64'),
    )
    return Buffer.from(signature, 'base64')
  }
}
