/* eslint-disable arrow-body-style */
/* eslint-disable no-bitwise */
import createHash from 'create-hash'
import sodium from 'libsodium-wrappers'

export const randomBytes = async (n: number): Promise<Buffer> => {
  await sodium.ready
  return Buffer.from(sodium.randombytes_buf(n))
}

export const sha256 = (buffer: Buffer | string): Buffer => createHash('sha256').update(buffer).digest()

export const lpad = (str: string | any[], padString: string, length: number) => {
  let strOut = str
  while (strOut.length < length) strOut = padString + strOut
  return strOut
}

export const bytesToBinary = (bytes: any[]) => bytes
  .map((x: { toString: (arg0: number) => string | any[] }) => lpad(x.toString(2), '0', 8))
  .join('')

export const binaryToByte = (bin: string) => parseInt(bin, 2)

export const deriveChecksumBits = (entropyBuffer: Buffer | string) => {
  const ENT = entropyBuffer.length * 8
  const CS = ENT / 32
  const hash = sha256(entropyBuffer)

  return bytesToBinary([].slice.call(hash)).slice(0, CS)
}

export const verify = async (
  signature: Uint8Array,
  message: string | Uint8Array,
  publicKey: Uint8Array,
) => {
  await sodium.ready
  return sodium.crypto_sign_verify_detached(signature, message, publicKey)
}
