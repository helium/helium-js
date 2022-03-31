export const ECC_COMPACT_KEY_TYPE = 0
export const ED25519_KEY_TYPE = 1
export const MULTISIG_KEY_TYPE = 2

export const SUPPORTED_KEY_TYPES = [
  ECC_COMPACT_KEY_TYPE,
  ED25519_KEY_TYPE,
  MULTISIG_KEY_TYPE,
]

export type KeyType = number
