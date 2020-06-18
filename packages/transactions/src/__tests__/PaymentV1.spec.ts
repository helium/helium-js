import proto from '@helium/proto'
import { PaymentV1, Transaction } from '..'
import {
  usersFixture,
  bobB58,
  aliceB58,
} from '../../../../integration_tests/fixtures/users'

Transaction.config({
  txnFeeMultiplier: 5000,
  dcPayloadSize: 24,
  stakingFeeTxnAddGatewayV1: 40 * 100000,
  stakingFeeTxnAssertLocationV1: 10 * 100000,
})

const paymentFixture = async () => {
  const { bob, alice } = await usersFixture()

  return new PaymentV1({
    payer: bob.address,
    payee: alice.address,
    amount: 10,
    nonce: 1,
  })
}

test('create a payment txn', async () => {
  const payment = await paymentFixture()
  expect(payment.payer?.b58).toBe(bobB58)
  expect(payment.payee?.b58).toBe(aliceB58)
  expect(payment.amount).toBe(10)
  expect(payment.nonce).toBe(1)
  expect(payment.fee).toBe(29792)
})

describe('serialize', () => {
  it('serializes a payment txn', async () => {
    const payment = await paymentFixture()
    expect(payment.serialize().length).toBeGreaterThan(0)
  })

  it('serializes to base64 string', async () => {
    const payment = await paymentFixture()
    const paymentString = payment.toString()
    // verify that we can decode it back from its serialized string
    const buf = Buffer.from(paymentString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    expect(decoded.payment?.amount.toNumber()).toBe(10)
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

    expect(Buffer.byteLength(Buffer.from(signedPayment.signature))).toBe(64)
  })
})
