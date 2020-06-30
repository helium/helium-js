import Balance from '../Balance'
import CurrencyType from '../CurrencyType'

describe('toString', () => {
  it('handles numbers with a large amount of decimal places', () => {
    const balance = new Balance(1, CurrencyType.default)
    expect(balance.toString()).toBe('0.00000001 HNT')
  })

  it('returns a string representation of the balance', () => {
    const balance = new Balance(10000, CurrencyType.default)
    expect(balance.toString()).toBe('0.0001 HNT')
  });

  it('does not round the string by default', () => {
    const balance = new Balance(1000000001, CurrencyType.default)
    expect(balance.toString()).toBe('10.00000001 HNT')
  });

  it('optionally allows the string to be rounded', () => {
    const balance = new Balance(1001000001, CurrencyType.default)
    expect(balance.toString(2)).toBe('10.01 HNT')
  });

  it('returns an integer if the rounded decimal places are 0', () => {
    const balance = new Balance(1000000001, CurrencyType.default)
    expect(balance.toString(2)).toBe('10 HNT')
  });

  it('does not round if the result would be 0 HNT', () => {
    const balance = new Balance(10000, CurrencyType.default)
    expect(balance.toString(2)).toBe('0.0001 HNT')
  })
})

describe('floatBalance', () => {
  it('returns a float based on the currency type', () => {
    const balance = new Balance(123456789012, CurrencyType.default)
    expect(balance.floatBalance).toBe(1234.56789012)
  })
})

describe('integerBalance', () => {
  it('returns the integer balance', () => {
    const balance = new Balance(123456789012, CurrencyType.default)
    expect(balance.integerBalance).toBe(123456789012)
  })
})
