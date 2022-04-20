import { Transaction } from '..'

describe('config', () => {
  it('has default values', () => {
    expect(Transaction.txnFeeMultiplier).toBe(0)
    expect(Transaction.dcPayloadSize).toBe(24)
    expect(Transaction.stakingFeeTxnAddGatewayV1).toBe(1)
    expect(Transaction.stakingFeeTxnAssertLocationV1).toBe(1)
  })

  it('configures transactions with chain vars', () => {
    const vars = {
      txnFeeMultiplier: 100,
      dcPayloadSize: 48,
      stakingFeeTxnAddGatewayV1: 1000,
      stakingFeeTxnAssertLocationV1: 2000,
    }

    Transaction.config(vars)

    expect(Transaction.txnFeeMultiplier).toBe(100)
    expect(Transaction.dcPayloadSize).toBe(48)
    expect(Transaction.stakingFeeTxnAddGatewayV1).toBe(1000)
    expect(Transaction.stakingFeeTxnAssertLocationV1).toBe(2000)
  })

  it('configures transactions without chain vars', () => {
    Transaction.config({})
    expect(Transaction).toBeDefined()
  })
})

describe('stringType', () => {
  it('returns the type of a serialized transaction', () => {
    const serializedAddGwTxn = 'CrMCCiEBHph7m4n8je5IHzLmg544qkxQb+K1g3efKHufp0dKURYSIQGySNPajUxhsIp5CIsV2et+Kx1XwECUOCUd4BBjekSeQxpAYCTigGLV8ch+5WmbbhO14L7mM2Djhidhl19b5zgE/Uo7T7j8OSa+Egir7oX3gkhs8frsUT4uNDrfi48ezN3tAiJAAqe3gcYc5sj3XWl0oUyVbHFhZSRu8gDcXV5+IeN6jwK6amQNm4clp1wR/JprHbI3kYbinzEwWIqzQs6miKWiByohAS85rAe4whjJEsnzyByyxV8UPRHvjl74cMb1+LadnbUjMkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOMC4Ag=='
    const serializedAssertV2 = 'mgLQAQo0ATEzTThkVWJ4eW1FM3h0aUFYc3pSa0dNbWV6TWhCUzhMaTd3RXNNb2pMZGI0U2R4YzR3YxI0ATE0OGQ4S1RSY0tBNUpLUGVrQmNLRmQ0S2Z2cHJ2RlJwakd0aXZodG1SbW5aOE1GWW5QMxo0ATEzTThkVWJ4eW1FM3h0aUFYc3pSa0dNbWV6TWhCUzhMaTd3RXNNb2pMZGI0U2R4YzR3YyIJsomesignaturKg2yiZ6i2F6uyKCdq26tMghsb2NhdGlvbjgBQAJIA1AFWAQ='

    expect(Transaction.stringType(serializedAddGwTxn)).toBe('addGateway')
    expect(Transaction.stringType(serializedAssertV2)).toBe('assertLocationV2')
  })
})
