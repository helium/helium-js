/**
 * [[include:crypto-react-native/README.md]]
 * @packageDocumentation
 * @module crypto-react-native
 */

export { default as Mnemonic } from './Mnemonic'
export { default as Keypair } from './Keypair'
export type { CryptoKeyType, CryptoKeyPair } from './Keypair'
export * as utils from './utils'

global.Buffer = require('safe-buffer').Buffer
