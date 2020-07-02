import Balance from '../Balance'
import CurrencyType from '../CurrencyType'

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

describe('toString', () => {
  it('handles numbers with a large amount of decimal places', () => {
    const balance = new Balance(1, CurrencyType.default)
    expect(balance.toString()).toBe('0.00000001 HNT')
  })

  it('returns a string representation of the balance', () => {
    const balance = new Balance(10000, CurrencyType.default)
    expect(balance.toString()).toBe('0.0001 HNT')
  })

  it('does not round the string by default', () => {
    const balance = new Balance(1000000001, CurrencyType.default)
    expect(balance.toString()).toBe('10.00000001 HNT')
  })

  it('optionally allows the string to be rounded', () => {
    const balance = new Balance(1001000001, CurrencyType.default)
    expect(balance.toString(2)).toBe('10.01 HNT')
  })

  it('returns an integer if the rounded decimal places are 0', () => {
    const balance = new Balance(1000000001, CurrencyType.default)
    expect(balance.toString(2)).toBe('10 HNT')
  })

  it('does not round if the result would be 0 HNT', () => {
    const balance = new Balance(10000, CurrencyType.default)
    expect(balance.toString(2)).toBe('0.0001 HNT')
  })
})

describe('toUsd', () => {
  it('converts a dc balance to a usd balance', () => {
    const dcBalance = new Balance(10 * 100000, CurrencyType.dataCredit)
    const usdBalance = dcBalance.toUsd()
    expect(usdBalance.toString(2)).toBe('10 USD')
  })

  it('converts an hnt balance to a usd balance', () => {
    const hntBalance = new Balance(10 * 100000000, CurrencyType.default)
    const oraclePrice = new Balance(0.45 * 100000000, CurrencyType.usd)
    const usdBalance = hntBalance.toUsd(oraclePrice)
    expect(usdBalance.toString(2)).toBe('4.50 USD')
  })

  it('returns itself if called on a usd balance', () => {
    const usdBalance = new Balance(10 * 100000000, CurrencyType.usd)
    expect(usdBalance.toUsd().toString()).toBe('10 USD')
  })
})

describe('toDefault', () => {
  it('converts a dc balance to an hnt balance', () => {
    const dcBalance = new Balance(10 * 100000, CurrencyType.dataCredit)
    const oraclePrice = new Balance(0.45 * 100000000, CurrencyType.usd)
    const hntBalance = dcBalance.toDefault(oraclePrice)
    expect(hntBalance.toString(2)).toBe('22.22 HNT')
  })

  it('converts a usd balance to an hnt balance', () => {
    const usdBalance = new Balance(10 * 100000000, CurrencyType.usd)
    const oraclePrice = new Balance(0.45 * 100000000, CurrencyType.usd)
    const hntBalance = usdBalance.toDefault(oraclePrice)
    expect(hntBalance.toString(2)).toBe('22.22 HNT')
  })

  it('returns itself if called on an hnt balance', () => {
    const hntBalance = new Balance(10 * 100000000, CurrencyType.default)
    expect(hntBalance.toDefault().toString()).toBe('10 HNT')
  })
})

describe('toDataCredit', () => {
  it('converts a usd balance to a dc balance', () => {
    const usdBalance = new Balance(10 * 100000000, CurrencyType.usd)
    const dcBalance = usdBalance.toDataCredit()
    expect(dcBalance.toString()).toBe('1,000,000 DC')
  })

  it('converts an hnt balance to a dc balance', () => {
    const hntBalance = new Balance(10 * 100000000, CurrencyType.default)
    const oraclePrice = new Balance(0.45 * 100000000, CurrencyType.usd)
    const dcBalance = hntBalance.toDataCredit(oraclePrice)
    expect(dcBalance.toString()).toBe('450,000 DC')
  })

  it('returns itself if called on a dc balance', () => {
    const dcBalance = new Balance(10 * 100000, CurrencyType.dataCredit)
    expect(dcBalance.toDataCredit().toString()).toBe('1,000,000 DC')
  })
})
