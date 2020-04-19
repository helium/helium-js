import Transaction, { PaymentV2 } from '../Transaction'

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
