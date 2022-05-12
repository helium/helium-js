/* eslint-disable no-bitwise */
import { sha256 } from 'js-sha256'
import bs58 from 'bs58'
import { KeyType } from './KeyTypes'
import { NetType } from './NetTypes'
import Address from './Address'

export const bs58CheckEncode = (version: number, binary: Buffer | Uint8Array): string => {
  const vPayload = Buffer.concat([
    Buffer.from([version]),
    binary,
  ])

  const checksum = sha256(Buffer.from(sha256(vPayload), 'hex'))
  const checksumBytes = Buffer.alloc(4, checksum, 'hex')

  const result = Buffer.concat([
    vPayload,
    checksumBytes,
  ])

  return bs58.encode(result)
}

export const bs58ToBin = (bs58Address: string): Buffer => {
  const bin = bs58.decode(bs58Address)
  const vPayload = bin.slice(0, -4)
  const payload = bin.slice(1, -4)
  const checksum = bin.slice(-4)

  const checksumVerify = sha256(Buffer.from(sha256(vPayload), 'hex'))
  const checksumVerifyBytes = Buffer.alloc(4, checksumVerify, 'hex')

  if (!checksumVerifyBytes.equals(Buffer.from(checksum))) {
    throw new Error('invalid checksum')
  }

  return Buffer.from(payload)
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

export const bs58M = (bs58Address: string): number => {
  const bin = bs58ToBin(bs58Address)
  const M = bin[1]
  return M
}

export const bs58N = (bs58Address: string): number => {
  const bin = bs58ToBin(bs58Address)
  const N = bin[2]
  return N
}

export const bs58MultisigPublicKey = (bs58Address: string): Buffer => {
  const bin = bs58ToBin(bs58Address)
  const publicKey = Buffer.from(bin).slice(3)
  return publicKey
}

export const sortAddresses = (addresses: Address[]): Address[] => {
  const addressMap = addresses.map((address) => {
    const charCodeArray = Array.from(address.b58).map((character):number => character.charCodeAt(0))
    return { address, buffer: new Uint8Array(charCodeArray) }
  })

  return addressMap.sort((a, b) => Buffer.compare(a.buffer, b.buffer)).map((obj) => obj.address)
}
