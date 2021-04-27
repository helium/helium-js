export interface Addressable {
  bin: Uint8Array
  b58: string
  publicKey: Uint8Array
}

export interface SignableKeypair {
  sign(message: string | Uint8Array): Promise<Uint8Array>
}

export type Base64Memo = string
