import { toAddressable, toNumber } from '../utils'

test('toAddressable with undefined', () => {
  expect(toAddressable(undefined)).toBe(undefined)
})

test('toNumber with undefined', () => {
  expect(toNumber(undefined)).toBe(undefined)
})

test('toNumber with number', () => {
  expect(toNumber(3)).toBe(3)
})
