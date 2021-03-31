import proto from '@helium/proto'
import { AssertLocationV2, Transaction } from '..'
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

  return new AssertLocationV2({
    owner: bob.address,
    gateway: alice.address,
    payer: payer ? bob.address : undefined,
    location: '8c383092841a7ff',
    nonce: 1,
    gain: 2,
    elevation: 3,
  })
}

test('create an assert location txn', async () => {
  const txn = await assertLocationFixture()
  expect(txn.owner?.b58).toBe(bobB58)
  expect(txn.gateway?.b58).toBe(aliceB58)
  expect(txn.location).toBe('8c383092841a7ff')
  expect(txn.nonce).toBe(1)
  expect(txn.gain).toBe(2)
  expect(txn.elevation).toBe(3)
  expect(txn.fee).toBe(35000)
  expect(txn.stakingFee).toBe(1000000)
  expect(txn.type).toBe('assert_location_v2')
})

test('create an assert location txn with a payer', async () => {
  const txn = await assertLocationFixture(true)
  expect(txn.owner?.b58).toBe(bobB58)
  expect(txn.gateway?.b58).toBe(aliceB58)
  expect(txn.payer?.b58).toBe(bobB58)
  expect(txn.location).toBe('8c383092841a7ff')
  expect(txn.nonce).toBe(1)
  expect(txn.gain).toBe(2)
  expect(txn.elevation).toBe(3)
  expect(txn.fee).toBe(55000)
  expect(txn.stakingFee).toBe(1000000)
})

describe('serialize', () => {
  it('serializes the txn', async () => {
    const txn = await assertLocationFixture()
    expect(txn.serialize().length).toBeGreaterThan(0)
  })

  it('serializes to base64 string', async () => {
    const txn = await assertLocationFixture()
    const txnString = txn.toString()
    // verify that we can decode it back from its serialized string
    const buf = Buffer.from(txnString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    expect(decoded.assertLocationV2?.fee?.toString()).toBe('35000')
  })

  it('deserializes from a base64 string', async () => {
    const assertLocation = await assertLocationFixture()
    const assertLocationString = assertLocation.toString()
    const deserialized = AssertLocationV2.fromString(assertLocationString)
    expect(deserialized.owner?.b58).toBe(assertLocation.owner?.b58)
    expect(deserialized.payer?.b58).toBe(assertLocation.payer?.b58)
    expect(deserialized.gateway?.b58).toBe(assertLocation.gateway?.b58)
    expect(deserialized.location).toBe(assertLocation.location)
    expect(deserialized.nonce).toBe(assertLocation.nonce)
    expect(deserialized.gain).toBe(assertLocation.gain)
    expect(deserialized.elevation).toBe(assertLocation.elevation)
    expect(deserialized.fee).toBe(assertLocation.fee)
    expect(deserialized.stakingFee).toBe(assertLocation.stakingFee)
    expect(deserialized.ownerSignature).toEqual(assertLocation.ownerSignature)
    expect(deserialized.payerSignature).toEqual(assertLocation.payerSignature)
  })
})

describe('sign', () => {
  it('adds the owner signature', async () => {
    const { bob, alice } = await usersFixture()
    const txn = new AssertLocationV2({
      owner: bob.address,
      gateway: alice.address,
    })

    const signedTxn = await txn.sign({ owner: bob })

    if (!signedTxn.ownerSignature) throw new Error('null')

    expect(Buffer.byteLength(Buffer.from(signedTxn.ownerSignature))).toBe(64)
  })

  it('adds the payer signature', async () => {
    const { bob, alice } = await usersFixture()
    const txn = new AssertLocationV2({
      owner: bob.address,
      payer: bob.address,
    })

    const signedTxn = await txn.sign({ payer: alice })

    if (!signedTxn.payerSignature) throw new Error('null')

    expect(Buffer.byteLength(Buffer.from(signedTxn.payerSignature))).toBe(64)
  })
})
