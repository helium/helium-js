import Address from '@helium/address'
import Long from 'long'
import { Addressable, TokenType } from './types'

export const toUint8Array = (str: string | Uint8Array | undefined | null): Uint8Array => Uint8Array.from(Buffer.from(str || ''))

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

export const toTokenType = ({
  ticker,
  defaultToUndefined,
}: {
  ticker?: string
  defaultToUndefined?: boolean
}): number | undefined => {
  switch (ticker?.toLowerCase()) {
    case 'hnt':
    default:
      return defaultToUndefined ? undefined : TokenType.hnt
    case 'hst':
      return TokenType.hst
    case 'mobile':
      return TokenType.mobile
    case 'iot':
      return TokenType.iot
  }
}

export const toTicker = (tokenType?: number): string => {
  switch (tokenType) {
    default:
    case TokenType.hnt:
      return 'hnt'
    case TokenType.hst:
      return 'hst'
    case TokenType.mobile:
      return 'mobile'
    case TokenType.iot:
      return 'iot'
  }
}
