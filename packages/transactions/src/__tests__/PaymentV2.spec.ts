import { PaymentV2 } from '..'
import { usersFixture, bobB58, aliceB58 } from '../../../../integration_tests/fixtures/users'

const paymentFixture = async () => {
  const { bob, alice } = await usersFixture()

  return new PaymentV2({
    payer: bob.address,
    payments: [
      {
        payee: alice.address,
        amount: 10,
      },
    ],
    fee: 3,
    nonce: 1,
    signature: "bob's signature",
  })
}

test('create a PaymentV2', async () => {
  const payment = await paymentFixture()

  expect(payment.payer?.b58).toBe(bobB58)
  expect(payment.payments?.length).toBe(1)
  expect((payment.payments || [])[0].payee.b58).toBe(aliceB58)
  expect((payment.payments || [])[0].amount).toBe(10)
  expect(payment.fee).toBe(3)
  expect(payment.nonce).toBe(1)
  expect(payment.signature).toBe("bob's signature")
})

describe('serialize', () => {
  it('serializes a PaymentV2 txn', async () => {
    const payment = await paymentFixture()
    expect(payment.serialize().length).toBe(58)
  })
})

describe('sign', () => {
  it('adds the payer signature', async () => {
    const { bob, alice } = await usersFixture()
    const payment = new PaymentV2({
      payer: bob.address,
      payments: [
        {
          payee: alice.address,
          amount: 10,
        },
      ],
      nonce: 1,
    })

    const signedPayment = await payment.sign({ payer: bob })

    if (!signedPayment.signature) throw new Error('null')

    expect(Buffer.from(signedPayment.signature).toString('base64')).toBe('rzwaOYb0KsRIdV1wv/9l9YP4qwGdsqZmoqXHygPz0VSazs6Nk1wvk2JDijSNESD5qGSNzaNfhKAoEGeIz5CgAA==')
  })
})
