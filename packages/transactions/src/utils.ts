import { Address } from '@helium/crypto'
import Long from 'long'
import { Addressable } from './types'

export const toUint8Array = (
  str: string | Uint8Array | undefined | null,
): Uint8Array => Uint8Array.from(Buffer.from(str || ''))

export const EMPTY_SIGNATURE = Uint8Array.from(Array(64).fill(0))

export const toAddressable = (
  bin: Buffer | Uint8Array | undefined | null,
): Addressable | undefined => {
  if (bin === undefined || bin === null) return undefined
  const buf = Buffer.from(bin)
  return Address.fromBin(buf)
}

export const toString = (long: Long | number | undefined | null): string | undefined => {
  if (long === undefined || long === null) return undefined
  const jsLong = typeof long === 'number' ? Long.fromNumber(long, true) : long
  if (jsLong.isZero()) return undefined
  const buff = Buffer.from(jsLong.toBytesLE())
  return buff.toString('base64')
}

export const toNumber = (long: Long | number | undefined | null): number | undefined => {
  if (long === undefined || long === null) return undefined
  if (typeof long === 'number') return long
  return long.toNumber()
}
