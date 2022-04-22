/* eslint-disable arrow-body-style */
/* eslint-disable no-bitwise */
import Sodium from 'react-native-sodium'
import { sha256 } from 'js-sha256'

export const randomBytes = async (n: number): Promise<Buffer> => {
  const bytes = await Sodium.randombytes_buf(n)
  return Buffer.from(bytes, 'base64')
}

export const lpad = (
  str: string | any[],
  padString: string,
  length: number,
) => {
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
  const hash = sha256.digest(entropyBuffer)

  return bytesToBinary(Array.from(hash)).slice(0, CS)
}

export const verify = async (signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array) => {
  return Sodium.crypto_sign_verify_detached(
    Buffer.from(signature).toString('base64'),
    Buffer.from(message).toString('base64'),
    Buffer.from(publicKey).toString('base64'),
  )
}
