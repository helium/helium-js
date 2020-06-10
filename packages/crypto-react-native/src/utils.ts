import Sodium from 'react-native-sodium'
import { sha256 } from 'js-sha256'
import bs58 from 'bs58'

export const randomBytes = async (n: number): Promise<Buffer> => {
  const bytes = await Sodium.randombytes_buf(n)
  return Buffer.from(bytes)
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
  const hash = sha256(entropyBuffer)

  return bytesToBinary([].slice.call(hash)).slice(0, CS)
}

export const bs58CheckEncode = (version: number, binary: Buffer | Uint8Array): string => {
  // VPayload = <<Version:8/unsigned-integer, Payload/binary>>,
  const vPayload = Buffer.concat([
    Buffer.from([version]),
    binary,
  ])

  // <<Checksum:4/binary, _/binary>> = crypto:hash(sha256, crypto:hash(sha256, VPayload)),
  const checksum = sha256(Buffer.from(sha256(vPayload), 'hex'))
  const checksumBytes = Buffer.alloc(4, checksum, 'hex')

  // Result = <<VPayload/binary, Checksum/binary>>,
  const result = Buffer.concat([
    vPayload,
    checksumBytes,
  ])

  // base58:binary_to_base58(Result).
  return bs58.encode(result)
}

export const bs58ToBin = (bs58Address: string): Buffer => {
  const bin = bs58.decode(bs58Address)
  const vPayload = bin.slice(0, -4)
  const payload = bin.slice(1, -4)
  const checksum = bin.slice(-4)

  const checksumVerify = sha256(Buffer.from(sha256(vPayload), 'hex'))
  const checksumVerifyBytes = Buffer.alloc(4, checksumVerify, 'hex')

  if (!checksumVerifyBytes.equals(checksum)) {
    throw new Error('invalid checksum')
  }

  return payload
}
