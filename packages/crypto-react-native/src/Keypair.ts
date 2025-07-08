import { ed25519 } from '@noble/curves/ed25519'
import Address, { KeyTypes, NetTypes } from '@helium/address'
import Mnemonic from './Mnemonic'

type NetType = NetTypes.NetType
interface NobleKeyPair {
  keyType?: string
  pk: Uint8Array
  sk: Uint8Array
}

export default class Keypair {
  public keypair!: NobleKeyPair

  public publicKey!: Buffer

  public privateKey!: Buffer

  public keyType!: string

  public netType!: NetType

  constructor(keypair: NobleKeyPair, netType?: NetType) {
    this.keypair = keypair
    this.publicKey = Buffer.from(keypair.pk)
    const privateKeyBuffer = new Uint8Array(64)
    privateKeyBuffer.set(keypair.sk, 0)
    privateKeyBuffer.set(keypair.pk, 32)
    this.privateKey = Buffer.from(privateKeyBuffer)
    this.keyType = keypair.keyType || 'ed25519'
    this.netType = netType || NetTypes.MAINNET
  }

  get address(): Address {
    return new Address(0, this.netType, KeyTypes.ED25519_KEY_TYPE, this.publicKey)
  }

  static async makeRandom(netType?: NetType): Promise<Keypair> {
    const privateKey = ed25519.utils.randomPrivateKey()
    const publicKey = ed25519.getPublicKey(privateKey)
    const keypair: NobleKeyPair = {
      keyType: 'ed25519',
      pk: publicKey,
      sk: privateKey,
    }
    return new Keypair(keypair, netType)
  }

  static async fromWords(words: Array<string>, netType?: NetType): Promise<Keypair> {
    const mnenomic = new Mnemonic(words)
    const keypair = await this.fromMnemonic(mnenomic, netType)
    return keypair
  }

  static async fromMnemonic(mnenomic: Mnemonic, netType?: NetType): Promise<Keypair> {
    const entropy = mnenomic.toEntropy()
    const seed = entropy.length === 16 ? Buffer.concat([entropy, entropy]) : entropy

    return Keypair.fromEntropy(seed, netType)
  }

  static async fromEntropy(entropy: Uint8Array | Buffer, netType?: NetType): Promise<Keypair> {
    const entropyBuffer = Buffer.from(entropy)
    if (Buffer.byteLength(entropyBuffer) !== 32) {
      throw new Error('Invalid entropy, must be 32 bytes')
    }

    const privateKey = entropyBuffer
    const publicKey = ed25519.getPublicKey(privateKey)
    const keypair: NobleKeyPair = {
      keyType: 'ed25519',
      pk: publicKey,
      sk: privateKey,
    }
    return new Keypair(keypair, netType)
  }

  async sign(message: string | Uint8Array): Promise<Uint8Array> {
    const messageBuffer =
      typeof message === 'string' ? Buffer.from(message) : Buffer.from(message.buffer)
    // Use the first 32 bytes of the private key for signing (the actual private key part)
    const actualPrivateKey = this.privateKey.slice(0, 32)
    const signature = ed25519.sign(messageBuffer, actualPrivateKey)
    return signature
  }
}
