import proto from '@helium/proto'
import { PaymentV2, Transaction } from '..'
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

  return new PaymentV2({
    payer: bob.address,
    payments: [
      {
        payee: alice.address,
        amount: 10,
      },
    ],
    nonce: 1,
  })
}

test('create a PaymentV2', async () => {
  const payment = await paymentFixture()

  expect(payment.payer?.b58).toBe(bobB58)
  expect(payment.payments?.length).toBe(1)
  expect((payment.payments || [])[0].payee.b58).toBe(aliceB58)
  expect((payment.payments || [])[0].amount).toBe(10)
  expect(payment.nonce).toBe(1)
  expect(payment.fee).toBe(35000)
})

describe('serialize and deserialize', () => {
  it('serializes a PaymentV2 txn', async () => {
    const payment = await paymentFixture()
    expect(payment.serialize().length).toBeGreaterThan(0)
  })

  it('serializes to base64 string', async () => {
    const payment = await paymentFixture()
    const paymentString = payment.toString()
    // verify that we can decode it back from its serialized string
    const buf = Buffer.from(paymentString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    expect(decoded.paymentV2?.nonce?.toString()).toBe('1')
  })

  it('deserializes from a base64 string', async () => {
    const payment = await paymentFixture()
    const paymentString = payment.toString()
    const deserialized = PaymentV2.fromString(paymentString)
    expect(deserialized.payer?.b58).toBe(payment.payer?.b58)
    expect(deserialized.nonce).toBe(payment.nonce)
    expect(deserialized.payments[0]?.amount).toBe(payment.payments[0]?.amount)
    expect(deserialized.payments[0]?.payee.b58).toBe(
      payment.payments[0]?.payee.b58,
    )
    expect(deserialized.fee).toBe(payment.fee)
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

    expect(Buffer.byteLength(Buffer.from(signedPayment.signature))).toBe(64)
  })

  it('preserves the signature when deserializing', async () => {
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
    const serializedPayment = signedPayment.toString()
    const deserializedPayment = PaymentV2.fromString(serializedPayment)
    expect(deserializedPayment.signature).toEqual(signedPayment.signature)
  })
})
