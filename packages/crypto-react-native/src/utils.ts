/* eslint-disable arrow-body-style */
/* eslint-disable no-bitwise */
import { sha256 as sha256Hash } from '@noble/hashes/sha2'
import { ed25519 } from '@noble/curves/ed25519'
import { randomBytes as nobleRandomBytes } from '@noble/hashes/utils'

export const randomBytes = (n: number): Promise<Buffer> => {
  return Promise.resolve(Buffer.from(nobleRandomBytes(n)))
}

export const sha256 = (buffer: Buffer | string): Buffer => {
  const input = typeof buffer === 'string' ? Buffer.from(buffer) : buffer
  return Buffer.from(sha256Hash(input))
}

export const lpad = (str: string | any[], padString: string, length: number) => {
  let strOut = str
  while (strOut.length < length) strOut = padString + strOut
  return strOut
}

export const bytesToBinary = (bytes: any[]) =>
  bytes
    .map((x: { toString: (arg0: number) => string | any[] }) => lpad(x.toString(2), '0', 8))
    .join('')

export const binaryToByte = (bin: string) => parseInt(bin, 2)

export const deriveChecksumBits = (entropyBuffer: Buffer | string) => {
  const ENT = entropyBuffer.length * 8
  const CS = ENT / 32
  const hash = sha256(entropyBuffer)

  return bytesToBinary(Array.from(hash)).slice(0, CS)
}

export const verify = (
  signature: Uint8Array,
  message: Uint8Array,
  publicKey: Uint8Array,
): Promise<boolean> => {
  try {
    const result = ed25519.verify(signature, message, publicKey)
    return Promise.resolve(result)
  } catch (error) {
    return Promise.resolve(false)
  }
}
