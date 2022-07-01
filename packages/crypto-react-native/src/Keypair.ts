import Sodium from 'react-native-sodium'
import Address, { KeyTypes, NetTypes } from '@helium/address'
import Mnemonic from './Mnemonic'

type KeyType = KeyTypes.KeyType
type NetType = NetTypes.NetType
interface SodiumKeyPair {
  keyType?: KeyType
  sk: string
  pk: string
}

// extend SodiumKeyPair?
export default class Keypair {
  public keypair!: SodiumKeyPair

  public publicKey!: Buffer

  public privateKey!: Buffer

  public keyType!: KeyType

  public netType!: NetType

  constructor(keypair: SodiumKeyPair, netType?: NetType) {
    this.keypair = keypair
    this.publicKey = Buffer.from(keypair.pk, 'base64')
    this.privateKey = Buffer.from(keypair.sk, 'base64')
    this.keyType = keypair.keyType || KeyTypes.ED25519_KEY_TYPE
    this.netType = netType || NetTypes.MAINNET
  }

  get address(): Address {
    return new Address(0, this.netType, KeyTypes.ED25519_KEY_TYPE, this.publicKey)
  }

  static async makeRandom(netType?: NetType): Promise<Keypair> {
    const keypair = await Sodium.crypto_sign_keypair()
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
    if (Buffer.byteLength(entropyBuffer) !== 32) { throw new Error('Invalid entropy, must be 32 bytes') }
    const keypair = await Sodium.crypto_sign_seed_keypair(
      entropyBuffer.toString('base64'),
    )
    return new Keypair(keypair, netType)
  }

  async sign(message: string | Uint8Array): Promise<Uint8Array> {
    const messageBuffer = Buffer.from(message)
    const signature = await Sodium.crypto_sign_detached(
      messageBuffer.toString('base64'),
      this.privateKey.toString('base64'),
    )
    return Uint8Array.from(Buffer.from(signature, 'base64'))
  }
}
