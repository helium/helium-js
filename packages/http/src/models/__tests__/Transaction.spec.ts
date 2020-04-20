import Transaction, { PaymentV2, RewardsV1 } from '../Transaction'

describe('PaymentV2', () => {
  it('exposes a totalAmount balance', () => {
    const json = {
      type: 'payment_v2',
      time: 1587132741,
      signature: 'RSXR9pkn9ZnkZOZ',
      payments: [
        {
          payee: '13DKymsEaCSpNTithKUbyn7zDEYV3xfoAsA2iFM6bsw8YtPaoCZ',
          amount: 75,
        },
      ],
      payer: '13sSQT9ZAvcDm7U6GizvUWZbHyT24NpNUdkeq8io7XJ9sggf4Yu',
      nonce: 1,
      height: 295781,
      hash: 'EZN6c6pZZZxii8vnGN10KxC-O3YvaEXTSEifl0ckUyQ',
      fee: 0,
    }
    const txn = Transaction.fromJsonObject(json) as PaymentV2
    expect(txn.totalAmount.integerBalance).toBe(75)
  })
})

describe('RewardsV1', () => {
  it('exposes a totalAmount balance', () => {
    const json = {
      type: 'rewards_v1',
      time: 1587424041,
      start_epoch: 300165,
      rewards: [
        {
          type: 'poc_witnesses',
          gateway: 'fake-gateway-address',
          amount: 2000,
          account: 'fake-owner-address',
        },
        {
          type: 'poc_witnesses',
          gateway: 'fake-gateway-address',
          amount: 1000,
          account: 'fake-owner-address',
        },
      ],
      height: 123456,
      hash: 'fake-txn-hash',
      end_epoch: 300195,
    }
    const txn = Transaction.fromJsonObject(json) as RewardsV1
    expect(txn.totalAmount.integerBalance).toBe(3000)
  })
})
