import { ed25519 } from '@noble/curves/ed25519'
import Address, { KeyTypes, NetTypes } from '@helium/address'
import Mnemonic from './Mnemonic'

type NetType = NetTypes.NetType
type KeyType = 'curve25519' | 'ed25519' | 'x25519'
interface KeyPair {
  keyType?: KeyType
  sk: string
  pk: string
}

export default class Keypair {
  public keypair!: KeyPair

  public publicKey!: Buffer

  public privateKey!: Buffer

  public keyType!: string

  public netType!: NetType

  constructor(keypair: KeyPair, netType?: NetType) {
    this.keypair = keypair
    this.publicKey = Buffer.from(keypair.pk, 'base64')
    // Create a 64-byte private key: first 32 bytes are the actual private key, last 32 bytes are the public key
    this.privateKey = Buffer.alloc(64)
    const actualPrivateKey = Buffer.from(keypair.sk, 'base64')
    this.privateKey.set(actualPrivateKey, 0)
    this.privateKey.set(this.publicKey, 32)
    this.keyType = keypair.keyType || 'ed25519'
    this.netType = netType || NetTypes.MAINNET
  }

  get address(): Address {
    return new Address(0, this.netType, KeyTypes.ED25519_KEY_TYPE, this.publicKey)
  }

  static async makeRandom(netType?: NetType): Promise<Keypair> {
    const privateKey = ed25519.utils.randomPrivateKey()
    const publicKey = ed25519.getPublicKey(privateKey)
    const keypair: KeyPair = {
      pk: Buffer.from(publicKey).toString('base64'),
      sk: Buffer.from(privateKey).toString('base64'),
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
    const keypair: KeyPair = {
      pk: Buffer.from(publicKey).toString('base64'),
      sk: Buffer.from(privateKey).toString('base64'),
    }
    return new Keypair(keypair, netType)
  }

  async sign(message: string | Uint8Array): Promise<Uint8Array> {
    const messageBuffer = Buffer.from(message)
    const actualPrivateKey = this.privateKey.slice(0, 32)
    const signature = ed25519.sign(messageBuffer, actualPrivateKey)
    return signature
  }
}
