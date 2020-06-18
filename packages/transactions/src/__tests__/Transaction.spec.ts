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
})
