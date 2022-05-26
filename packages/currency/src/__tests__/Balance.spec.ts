import { Balance, CurrencyType } from '..'

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

  it('does not round the string with null or undefined', () => {
    const balance = new Balance(1000000001, CurrencyType.default)
    // @ts-ignore
    expect(balance.toString(null)).toBe('10.00000001 HNT')
    expect(balance.toString(undefined)).toBe('10.00000001 HNT')
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

  it('rounds string with 0 max decimal places', () => {
    const balance = new Balance(1234567891, CurrencyType.default)
    expect(balance.toString(0)).toBe('12 HNT')
  })

  describe('format options', () => {
    it('show ticker', () => {
      const balance = new Balance(10000, CurrencyType.default)
      expect(balance.toString(2, { showTicker: false })).toBe('0.0001')
    })

    it('decimalSeparator and groupSeparator', () => {
      const balance = new Balance(100000000001, CurrencyType.default)
      expect(balance.toString(8, { decimalSeparator: ',', groupSeparator: '.' })).toBe('1.000,00000001 HNT')
    })
  })
})

describe('plus', () => {
  it('adds two balances together', () => {
    const balanceA = new Balance(100000000, CurrencyType.default)
    const balanceB = new Balance(200000000, CurrencyType.default)
    expect(balanceA.plus(balanceB).integerBalance).toBe(300000000)
  })

  it('throws an error if currency types are mixed', () => {
    const balanceA = new Balance(100000000, CurrencyType.default)
    const balanceB = new Balance(200000000, CurrencyType.dataCredit)

    expect(() => {
      balanceA.plus(balanceB)
    }).toThrow()
  })
})

describe('minus', () => {
  it('subtracts one balance from another', () => {
    const balanceA = new Balance(500000000, CurrencyType.default)
    const balanceB = new Balance(200000000, CurrencyType.default)
    expect(balanceA.minus(balanceB).integerBalance).toBe(300000000)
  })

  it('throws an error if currency types are mixed', () => {
    const balanceA = new Balance(100000000, CurrencyType.default)
    const balanceB = new Balance(200000000, CurrencyType.dataCredit)

    expect(() => {
      balanceA.minus(balanceB)
    }).toThrow()
  })
})

describe('times', () => {
  it('multiplies a balance by some number', () => {
    const balanceA = new Balance(300000000, CurrencyType.default)
    expect(balanceA.times(2).integerBalance).toBe(600000000)
  })
})

describe('dividedBy', () => {
  it('divides a balance by some number', () => {
    const balanceA = new Balance(900000000, CurrencyType.default)
    expect(balanceA.dividedBy(3).integerBalance).toBe(300000000)
  })
})

describe('toUsd', () => {
  it('converts a dc balance to a usd balance', () => {
    const dcBalance = new Balance(10 * 100000, CurrencyType.dataCredit)
    const usdBalance = dcBalance.toUsd()
    expect(usdBalance.toString(2)).toBe('10 USD')
  })

  it('converts a mobile balance to a usd balance', () => {
    const mobileBalance = new Balance(10 * 100000000, CurrencyType.mobileToken)
    const oraclePrice = new Balance(0.33 * 100000000, CurrencyType.usd)
    const usdBalance = mobileBalance.toUsd(oraclePrice)
    expect(usdBalance.toString(2)).toBe('3.30 USD')
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

describe('toNetworkTokens', () => {
  it('converts a dc balance to an hnt balance', () => {
    const dcBalance = new Balance(10 * 100000, CurrencyType.dataCredit)
    const oraclePrice = new Balance(0.45 * 100000000, CurrencyType.usd)
    const hntBalance = dcBalance.toNetworkTokens(oraclePrice)
    expect(hntBalance.toString(2)).toBe('22.22 HNT')
  })

  it('converts a mobile balance to an hnt balance', () => {
    const convert = (opts: { mobile: number, hntOracle: number, mobileOracle: number }) => {
      const mobileBalance = new Balance(opts.mobile * 100000000, CurrencyType.mobileToken)
      const hntOraclePrice = new Balance(opts.hntOracle * 100000000, CurrencyType.usd)
      const mobileOraclePrice = new Balance(opts.mobileOracle * 100000000, CurrencyType.usd)
      return mobileBalance.toNetworkTokens(hntOraclePrice, mobileOraclePrice)
    }

    expect(convert({ mobile: 4, hntOracle: 8, mobileOracle: 2 }).toString(2)).toBe('1 HNT')
    expect(convert({ mobile: 5, hntOracle: 8, mobileOracle: 2 }).toString(2)).toBe('1.25 HNT')
    expect(convert({ mobile: 4, hntOracle: 7.59, mobileOracle: 0.33 }).toString(2)).toBe('0.17 HNT')
  })

  it('converts a usd balance to an hnt balance', () => {
    const usdBalance = new Balance(10 * 100000000, CurrencyType.usd)
    const oraclePrice = new Balance(0.45 * 100000000, CurrencyType.usd)
    const hntBalance = usdBalance.toNetworkTokens(oraclePrice)
    expect(hntBalance.toString(2)).toBe('22.22 HNT')
  })

  it('returns itself if called on an hnt balance', () => {
    const hntBalance = new Balance(10 * 100000000, CurrencyType.default)
    expect(hntBalance.toNetworkTokens().toString()).toBe('10 HNT')
  })
})

describe('toTestNetworkTokens', () => {
  it('converts a mobile balance to a tnt balance', () => {
    const convert = (opts: { mobile: number, hntOracle: number, mobileOracle: number }) => {
      const mobileBalance = new Balance(opts.mobile * 100000000, CurrencyType.mobileToken)
      const hntOraclePrice = new Balance(opts.hntOracle * 100000000, CurrencyType.usd)
      const mobileOraclePrice = new Balance(opts.mobileOracle * 100000000, CurrencyType.usd)
      return mobileBalance.toTestNetworkTokens(hntOraclePrice, mobileOraclePrice)
    }

    expect(convert({ mobile: 4, hntOracle: 8, mobileOracle: 2 }).toString(2)).toBe('1 TNT')
    expect(convert({ mobile: 5, hntOracle: 8, mobileOracle: 2 }).toString(2)).toBe('1.25 TNT')
    expect(convert({ mobile: 4, hntOracle: 7.59, mobileOracle: 0.33 }).toString(2)).toBe('0.17 TNT')
  })

  it('converts a dc balance to an tnt balance', () => {
    const dcBalance = new Balance(10 * 100000, CurrencyType.dataCredit)
    const oraclePrice = new Balance(0.45 * 100000000, CurrencyType.usd)
    const tntBalance = dcBalance.toTestNetworkTokens(oraclePrice)
    expect(tntBalance.toString(2)).toBe('22.22 TNT')
  })

  it('converts a usd balance to an tnt balance', () => {
    const usdBalance = new Balance(10 * 100000000, CurrencyType.usd)
    const oraclePrice = new Balance(0.45 * 100000000, CurrencyType.usd)
    const tntBalance = usdBalance.toTestNetworkTokens(oraclePrice)
    expect(tntBalance.toString(2)).toBe('22.22 TNT')
  })

  it('returns itself if called on an tnt balance', () => {
    const tntBalance = new Balance(10 * 100000000, CurrencyType.testNetworkToken)
    expect(tntBalance.toString()).toBe('10 TNT')
  })
})

describe('toDataCredits', () => {
  it('converts a usd balance to a dc balance', () => {
    const usdBalance = new Balance(10 * 100000000, CurrencyType.usd)
    const dcBalance = usdBalance.toDataCredits()
    expect(dcBalance.toString()).toBe('1,000,000 DC')
  })

  it('converts an hnt balance to a dc balance', () => {
    const hntBalance = new Balance(10 * 100000000, CurrencyType.default)
    const oraclePrice = new Balance(0.45 * 100000000, CurrencyType.usd)
    const dcBalance = hntBalance.toDataCredits(oraclePrice)
    expect(dcBalance.toString()).toBe('450,000 DC')
  })

  it('returns itself if called on a dc balance', () => {
    const dcBalance = new Balance(10 * 100000, CurrencyType.dataCredit)
    expect(dcBalance.toDataCredits().toString()).toBe('1,000,000 DC')
  })
})

describe('trying to convert a security token balance', () => {
  it('throws an error when converting to usd', () => {
    const hstBalance = new Balance(100000000, CurrencyType.security)
    expect(() => {
      hstBalance.toUsd()
    }).toThrow()
  })

  it('throws an error when converting to hnt', () => {
    const hstBalance = new Balance(100000000, CurrencyType.security)
    expect(() => {
      hstBalance.toNetworkTokens()
    }).toThrow()
  })

  it('throws an error when converting to dc', () => {
    const hstBalance = new Balance(100000000, CurrencyType.security)
    expect(() => {
      hstBalance.toDataCredits()
    }).toThrow()
  })
})
