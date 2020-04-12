import { PaymentV1 } from '../'
import { usersFixture } from '../../../../integration_tests/fixtures/users'

const paymentFixture = async () => {
  const { bob, alice } = await usersFixture()

  return new PaymentV1({
    payer: bob.address,
    payee: alice.address,
    amount: 10,
    nonce: 1,
    fee: 3,
    signature: "bob's signature",
  })
}


test('create a payment txn', async () => {
  const payment = await paymentFixture()
  const { bob, alice } = await usersFixture()
  expect(payment.payer?.b58).toBe(bob.address.b58)
  expect(payment.payee?.b58).toBe(alice.address.b58)
  expect(payment.amount).toBe(10)
  expect(payment.fee).toBe(3)
  expect(payment.nonce).toBe(1)
  expect(payment.signature).toBe("bob's signature")
})

describe('serialize', () => {
  it('serializes a payment txn', async () => {
    const payment = await paymentFixture()
    expect(payment.serialize().length).toBe(95)
  })

  it('serializes to base64 string', async () => {
    const payment = await paymentFixture()
    expect(payment.toString()).toBe('Ql0KIQE1GnHCL+/sIjGTatKCayF+zjnZ93/GxJY5kmKZw4aSlRIhAZxlnXI8wegQpy54996vRzaofxDvj8/IAQC1Myfn7kmkGAogAygBMg9ib2IncyBzaWduYXR1cmU=')
  })
})


describe('sign', () => {
  it('adds the payer signature', async () => {
    const { bob, alice } = await usersFixture()
    const payment = new PaymentV1({
      payer: bob.address,
      payee: alice.address,
      amount: 10,
      nonce: 1,
    })

    const signedPayment = await payment.sign({ payer: bob })

    if (!signedPayment.signature) throw new Error('null')

    expect(Buffer.from(signedPayment.signature).toString('base64')).toBe('yxLonpII3WdNiNg99WaRlS623HzkxIqPM7Vvjr62JtFnZrSP4zudIvz6vP/U9arXIlDbiyvO5nfiNM6tPmuzBw==')
  })
})
