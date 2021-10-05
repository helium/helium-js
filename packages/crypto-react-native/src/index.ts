/**
 * [[include:crypto-react-native/README.md]]
 * @packageDocumentation
 * @module crypto-react-native
 */

export { default as Mnemonic } from './Mnemonic'
export { default as Keypair } from './Keypair'
export { default as Address } from './Address'
export * as utils from './utils'

global.Buffer = require('safe-buffer').Buffer
