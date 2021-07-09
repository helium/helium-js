/* eslint-disable no-bitwise */
import createHash from 'create-hash'
import bs58 from 'bs58'
import sodium from 'libsodium-wrappers'
import { NetType } from './NetType'
import { KeyType } from './KeyType'

export const randomBytes = async (n: number): Promise<Buffer> => {
  await sodium.ready
  return Buffer.from(sodium.randombytes_buf(n))
}

export const sha256 = (buffer: Buffer | string): Buffer =>
  createHash('sha256').update(buffer).digest()

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

  return bytesToBinary([].slice.call(hash)).slice(0, CS)
}

export const bs58CheckEncode = (version: number, binary: Buffer | Uint8Array): string => {
  // VPayload = <<Version:8/unsigned-integer, Payload/binary>>,
  const vPayload = Buffer.concat([Buffer.from([version]), binary])

  // <<Checksum:4/binary, _/binary>> = crypto:hash(sha256, crypto:hash(sha256, VPayload)),
  const checksum = sha256(Buffer.from(sha256(vPayload)))
  const checksumBytes = Buffer.alloc(4, checksum, 'hex')

  // Result = <<VPayload/binary, Checksum/binary>>,
  const result = Buffer.concat([vPayload, checksumBytes])

  // base58:binary_to_base58(Result).
  return bs58.encode(result)
}

export const bs58ToBin = (bs58Address: string): Buffer => {
  const bin = bs58.decode(bs58Address)
  const vPayload = bin.slice(0, -4)
  const payload = bin.slice(1, -4)
  const checksum = bin.slice(-4)

  const checksumVerify = sha256(Buffer.from(sha256(vPayload)))
  const checksumVerifyBytes = Buffer.alloc(4, checksumVerify, 'hex')

  if (!checksumVerifyBytes.equals(checksum)) {
    throw new Error('invalid checksum')
  }

  return payload
}

export const byteToNetType = (byte: number): NetType => byte & 0xf0
export const byteToKeyType = (byte: number): KeyType => byte & 0x0f

export const bs58NetType = (bs58Address: string): NetType => {
  const bin = bs58ToBin(bs58Address)
  const byte = Buffer.from(bin).slice(0, 1)[0]
  return byteToNetType(byte)
}

export const bs58KeyType = (bs58Address: string): KeyType => {
  const bin = bs58ToBin(bs58Address)
  const byte = Buffer.from(bin).slice(0, 1)[0]
  return byteToKeyType(byte)
}

export const bs58Version = (bs58Address: string): number => {
  const bin = bs58.decode(bs58Address)
  const version = bin.slice(0, 1)[0]
  return version
}

export const bs58PublicKey = (bs58Address: string): Buffer => {
  const bin = bs58ToBin(bs58Address)
  const publicKey = Buffer.from(bin).slice(1)
  return publicKey
}
