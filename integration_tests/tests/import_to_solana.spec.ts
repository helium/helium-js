import * as solanaWeb3 from '@solana/web3.js'
import { Keypair } from '@helium/crypto'
import bs58 from 'bs58'
import * as bip39 from 'bip39'
import { bobB58, bobBip39Words, bobWords } from '../fixtures/users'
import { Mnemonic } from '@helium/crypto'
import Address from '@helium/address'

test('import helium keypair to solana from secret key', async () => {
  const bob = await Keypair.fromWords(bobWords)
  const hntPubkey = bs58.encode(bob.publicKey)

  const solKey = solanaWeb3.Keypair.fromSecretKey(bob.privateKey)
  const solPubkey = solKey.publicKey.toBase58()

  expect(solPubkey).toEqual(hntPubkey)
})

test('import helium keypair to solana from mnemonic', async () => {
  const mnemonic = new Mnemonic(bobWords)
  const entropy = mnemonic.toEntropy()
  const solKey = solanaWeb3.Keypair.fromSeed(Buffer.from([...entropy, ...entropy]))
  const solPubkey = solKey.publicKey.toBase58()

  const bob = await Keypair.fromWords(bobWords)
  const hntPubkey = bs58.encode(bob.publicKey)

  expect(solPubkey).toEqual(hntPubkey)
})

test('convert helium mnemonic to bip39 mneonmic', async () => {
  const mnemonic = new Mnemonic(bobWords)
  const entropy = mnemonic.toEntropy()

  const bip39Mnemonic = bip39.entropyToMnemonic(entropy.toString('hex'))

  expect(bip39Mnemonic.split(' ')).toEqual(bobBip39Words)
})

test('import bip39 mnemonic to solana', async () => {
  const seed = bip39.mnemonicToEntropy(bobBip39Words.join(' '))
  const solKey = solanaWeb3.Keypair.fromSeed(Buffer.from(seed + seed, 'hex'))
  const solPubkey = solKey.publicKey.toBase58()

  const bob = await Keypair.fromWords(bobWords)
  const hntPubkey = bs58.encode(bob.publicKey)

  expect(solPubkey).toEqual(hntPubkey)
})

// test('convert helium address to solana address', async () => {
//   const bob = await Keypair.fromWords(bobWords)
//   const bobAddress = bob.address

//   const solKey = solanaWeb3.Keypair.fromSecretKey(bob.privateKey)
//   const solPubkey = solKey.publicKey.toBase58()

//   expect(bs58.encode(bobAddress.publicKey)).toBe(solPubkey)
// })

test('convert helium address to solana address', async () => {
  const bob = await Keypair.fromWords(bobWords)
  const bobAddress = Address.fromB58(bobB58)

  const solKey = solanaWeb3.Keypair.fromSecretKey(bob.privateKey)
  const solPubkey = solKey.publicKey.toBase58()

  expect(bs58.encode(bobAddress.publicKey)).toBe(solPubkey)
})
