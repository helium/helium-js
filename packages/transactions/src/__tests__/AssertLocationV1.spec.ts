import proto from '@helium/proto'
import { AssertLocationV1, Transaction } from '..'
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

const assertLocationFixture = async (payer = false) => {
  const { bob, alice } = await usersFixture()

  return new AssertLocationV1({
    owner: bob.address,
    gateway: alice.address,
    payer: payer ? bob.address : undefined,
    location: '8c383092841a7ff',
    nonce: 1,
  })
}

test('create an assert location txn', async () => {
  const txn = await assertLocationFixture()
  expect(txn.owner?.b58).toBe(bobB58)
  expect(txn.gateway?.b58).toBe(aliceB58)
  expect(txn.location).toBe('8c383092841a7ff')
  expect(txn.nonce).toBe(1)
  expect(txn.fee).toBe(50000)
  expect(txn.stakingFee).toBe(1000000)
  expect(txn.type).toBe('assert_location_v1')
})

test('create an assert location txn with a payer', async () => {
  const txn = await assertLocationFixture(true)
  expect(txn.owner?.b58).toBe(bobB58)
  expect(txn.gateway?.b58).toBe(aliceB58)
  expect(txn.payer?.b58).toBe(bobB58)
  expect(txn.location).toBe('8c383092841a7ff')
  expect(txn.nonce).toBe(1)
  expect(txn.fee).toBe(70000)
  expect(txn.stakingFee).toBe(1000000)
})

describe('serialize', () => {
  it('serializes an add gw txn', async () => {
    const txn = await assertLocationFixture()
    expect(txn.serialize().length).toBeGreaterThan(0)
  })

  it('serializes to base64 string', async () => {
    const txn = await assertLocationFixture()
    const txnString = txn.toString()
    // verify that we can decode it back from its serialized string
    const buf = Buffer.from(txnString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    expect(decoded.assertLocation?.fee?.toString()).toBe('50000')
  })

  it('deserializes from a base64 string', async () => {
    const assertLocation = await assertLocationFixture()
    const assertLocationString = assertLocation.toString()
    const deserialized = AssertLocationV1.fromString(assertLocationString)
    expect(deserialized.owner?.b58).toBe(assertLocation.owner?.b58)
    expect(deserialized.payer?.b58).toBe(assertLocation.payer?.b58)
    expect(deserialized.gateway?.b58).toBe(assertLocation.gateway?.b58)
    expect(deserialized.location).toBe(assertLocation.location)
    expect(deserialized.nonce).toBe(assertLocation.nonce)
    expect(deserialized.fee).toBe(assertLocation.fee)
    expect(deserialized.stakingFee).toBe(assertLocation.stakingFee)
    expect(deserialized.ownerSignature).toEqual(assertLocation.ownerSignature)
    expect(deserialized.payerSignature).toEqual(assertLocation.payerSignature)
    expect(deserialized.gatewaySignature).toEqual(assertLocation.gatewaySignature)
  })
})

describe('sign', () => {
  it('adds the owner signature', async () => {
    const { bob, alice } = await usersFixture()
    const payment = new AssertLocationV1({
      owner: bob.address,
      gateway: alice.address,
    })

    const signedPayment = await payment.sign({ owner: bob })

    if (!signedPayment.ownerSignature) throw new Error('null')

    expect(Buffer.byteLength(Buffer.from(signedPayment.ownerSignature))).toBe(64)
  })

  it('adds the gateway signature', async () => {
    const { bob, alice } = await usersFixture()
    const payment = new AssertLocationV1({
      owner: bob.address,
      gateway: alice.address,
    })

    const signedPayment = await payment.sign({ gateway: alice })

    if (!signedPayment.gatewaySignature) throw new Error('null')

    expect(Buffer.byteLength(Buffer.from(signedPayment.gatewaySignature))).toBe(64)
  })

  it('adds the payer signature', async () => {
    const { bob, alice } = await usersFixture()
    const payment = new AssertLocationV1({
      owner: bob.address,
      gateway: alice.address,
      payer: bob.address,
    })

    const signedPayment = await payment.sign({ payer: alice })

    if (!signedPayment.payerSignature) throw new Error('null')

    expect(Buffer.byteLength(Buffer.from(signedPayment.payerSignature))).toBe(64)
  })
})
