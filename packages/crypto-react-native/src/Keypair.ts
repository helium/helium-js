import Sodium from 'react-native-sodium'
import Mnemonic from './Mnemonic'
import Address from './Address'

interface SodiumKeyPair {
  sk: string
  pk: string
}

// extend SodiumKeyPair?
export default class Keypair {
  public keypair!: SodiumKeyPair
  public publicKey!: string
  public privateKey!: string

  constructor(keypair: SodiumKeyPair) {
    this.keypair = keypair
    this.publicKey = keypair.pk
    this.privateKey = keypair.sk
  }

  get address(): Address {
    return new Address(this.publicKey)
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
    if (Buffer.byteLength(entropyBuffer) !== 32) throw new Error('Invalid entropy, must be 32 bytes')
    const keypair = await Sodium.crypto_sign_seed_keypair(entropy.toString())
    return new Keypair(keypair)
  }

  async sign(message: string | Uint8Array): Promise<string> {
    const signature = await Sodium.crypto_sign_detached(message.toString(), this.privateKey)
    return signature
  }
}
