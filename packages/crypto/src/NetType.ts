import { SUPPORTED_KEY_TYPES } from './KeyType'

export const MAINNET = 0x00
export const TESTNET = 0x10

export const SUPPORTED_NET_TYPES = [
  MAINNET,
  TESTNET,
] as const

export type NetType = typeof SUPPORTED_KEY_TYPES[number]
