export interface Addressable {
  bin: Uint8Array
  b58: string
  publicKey: Uint8Array
}

export interface SignableKeypair {
  sign(message: string | Uint8Array): Promise<Uint8Array>
}

export type Base64Memo = string

export enum TokenType {
  hnt = 0,
  hst = 1,
  mobile = 2,
  iot = 3,
}
