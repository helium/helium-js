import { ed25519 } from '@noble/curves/ed25519'
import Address, { KeyTypes, NetTypes } from '@helium/address'
import Mnemonic from './Mnemonic'

const { ED25519_KEY_TYPE } = KeyTypes
const { MAINNET } = NetTypes

type NetType = NetTypes.NetType

interface NobleKeyPair {
  keyType: string
  publicKey: Uint8Array
  privateKey: Uint8Array
}

export default class Keypair {
  public keypair!: NobleKeyPair

  public publicKey!: Uint8Array

  public privateKey!: Uint8Array

  public keyType!: string

  public netType!: NetType

  constructor(keypair: NobleKeyPair, netType?: NetType) {
    this.keypair = keypair
    this.publicKey = keypair.publicKey
    this.privateKey = new Uint8Array(64)
    this.privateKey.set(keypair.privateKey, 0)
    this.privateKey.set(keypair.publicKey, 32)
    this.keyType = keypair.keyType
    this.netType = netType || MAINNET
  }

  get address(): Address {
    return new Address(0, this.netType, ED25519_KEY_TYPE, this.publicKey)
  }

  static async makeRandom(netType?: NetType): Promise<Keypair> {
    const privateKey = ed25519.utils.randomPrivateKey()
    const publicKey = ed25519.getPublicKey(privateKey)
    const keypair: NobleKeyPair = {
      keyType: 'ed25519',
      publicKey,
      privateKey,
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
    if (Buffer.byteLength(entropyBuffer) !== 32)
      throw new Error('Invalid entropy, must be 32 bytes')

    const privateKey = entropyBuffer
    const publicKey = ed25519.getPublicKey(privateKey)
    const keypair: NobleKeyPair = {
      keyType: 'ed25519',
      publicKey,
      privateKey,
    }
    return new Keypair(keypair, netType)
  }

  async sign(message: string | Uint8Array): Promise<Uint8Array> {
    const messageBytes = typeof message === 'string' ? Buffer.from(message) : message
    const actualPrivateKey = this.privateKey.slice(0, 32)
    const signature = ed25519.sign(messageBytes, actualPrivateKey)
    return signature
  }
}
