import * as JSLong from 'long'
import { toAddressable, toNumber, toString } from '../utils'

test('toAddressable with undefined', () => {
  expect(toAddressable(undefined)).toBe(undefined)
})

test('toNumber with undefined', () => {
  expect(toNumber(undefined)).toBe(undefined)
})

test('toNumber with number', () => {
  expect(toNumber(3)).toBe(3)
})

describe('toString', () => {
  test('from long', () => {
    const base64String = 'bW9ja21lbW8=' // "mockmemo" it can only be 8 bytes max
    const buff = Buffer.from(base64String, 'base64')
    const long = JSLong.fromBytes(Array.from(buff), true, true)
    const result = toString(long) || ''
    const resultBuff = Buffer.from(result, 'base64')
    expect(result).toBe(base64String)
    expect(resultBuff.toString('utf8')).toBe('mockmemo')
  })

  test('from number', () => {
    const base64String = 'YWJj' // using js number limits size, string is "abc"
    const buff = Buffer.from(base64String, 'base64')
    const long = JSLong.fromBytes(Array.from(buff), true, true)
    const result = toString(long.toNumber()) || ''
    const resultBuff = Buffer.from(result, 'base64')
    expect(resultBuff.toString('utf8')).toMatch('abc')
  })

  test('undefined', () => {
    expect(toString(undefined)).toBe(undefined)
  })
})
