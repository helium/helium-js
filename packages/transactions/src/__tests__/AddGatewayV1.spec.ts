import proto from '@helium/proto'
import { AddGatewayV1, Transaction } from '..'
import { usersFixture, bobB58, aliceB58 } from '../../../../integration_tests/fixtures/users'
import { EMPTY_SIGNATURE } from '../utils'

Transaction.config({
  txnFeeMultiplier: 5000,
  dcPayloadSize: 24,
  stakingFeeTxnAddGatewayV1: 40 * 100000,
  stakingFeeTxnAssertLocationV1: 10 * 100000,
})

const addGatewayFixture = async (payer = false) => {
  const { bob, alice } = await usersFixture()

  return new AddGatewayV1({
    owner: bob.address,
    gateway: alice.address,
    payer: payer ? bob.address : undefined,
  })
}

test('create an add gateway txn', async () => {
  const addGw = await addGatewayFixture()
  expect(addGw.owner?.b58).toBe(bobB58)
  expect(addGw.gateway?.b58).toBe(aliceB58)
  expect(addGw.fee).toBe(45000)
  expect(addGw.stakingFee).toBe(4000000)
  expect(addGw.type).toBe('add_gateway_v1')
})

test('create an add gateway txn with payer', async () => {
  const addGw = await addGatewayFixture(true)
  expect(addGw.owner?.b58).toBe(bobB58)
  expect(addGw.gateway?.b58).toBe(aliceB58)
  expect(addGw.payer?.b58).toBe(bobB58)
  expect(addGw.fee).toBe(65000)
  expect(addGw.stakingFee).toBe(4000000)
})

describe('serialize and deserialize', () => {
  it('serializes an add gw txn', async () => {
    const txn = await addGatewayFixture()
    expect(txn.serialize().length).toBeGreaterThan(0)
  })

  it('serializes to base64 string', async () => {
    const txn = await addGatewayFixture()
    const txnString = txn.toString()
    // verify that we can decode it back from its serialized string
    const buf = Buffer.from(txnString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    expect(decoded.addGateway?.fee?.toString()).toBe('45000')
  })

  it('deserializes from a base64 string', async () => {
    const addGateway = await addGatewayFixture()
    const addGatewayString = addGateway.toString()
    const deserialized = AddGatewayV1.fromString(addGatewayString)
    expect(deserialized.owner?.b58).toBe(addGateway.owner?.b58)
    expect(deserialized.payer?.b58).toBe(addGateway.payer?.b58)
    expect(deserialized.gateway?.b58).toBe(addGateway.gateway?.b58)
    expect(deserialized.fee).toBe(addGateway.fee)
    expect(deserialized.stakingFee).toBe(addGateway.stakingFee)
    expect(deserialized.ownerSignature).toEqual(addGateway.ownerSignature)
    expect(deserialized.payerSignature).toEqual(addGateway.payerSignature)
    expect(deserialized.gatewaySignature).toEqual(addGateway.gatewaySignature)
  })

  it('deserializes (with signatures) from a base64 string', async () => {
    const addGateway = await addGatewayFixture()
    const paymentString = addGateway.toString()
    const deserialized = AddGatewayV1.fromString(paymentString)
    expect(deserialized.owner?.b58).toBe(addGateway.owner?.b58)
    expect(deserialized.payer?.b58).toBe(addGateway.payer?.b58)
    expect(deserialized.gateway?.b58).toBe(addGateway.gateway?.b58)
    expect(deserialized.fee).toBe(addGateway.fee)
    expect(deserialized.stakingFee).toBe(addGateway.stakingFee)
    expect(deserialized.ownerSignature).toEqual(addGateway.ownerSignature)
    expect(deserialized.payerSignature).toEqual(addGateway.payerSignature)
    expect(deserialized.gatewaySignature).toEqual(addGateway.gatewaySignature)
  })

  it('deserializes empty string', async () => {
    const deserialized = AddGatewayV1.fromString('')
    expect(deserialized.owner?.b58).toBe(undefined)
    expect(deserialized.payer?.b58).toBe(undefined)
    expect(deserialized.gateway?.b58).toBe(undefined)
    expect(deserialized.fee).toBe(30_000)
    expect(deserialized.stakingFee).toBe(4_000_000)
    expect(deserialized.ownerSignature).toEqual(EMPTY_SIGNATURE)
    expect(deserialized.payerSignature).toEqual(undefined)
    expect(deserialized.gatewaySignature).toEqual(EMPTY_SIGNATURE)
  })
})

describe('sign', () => {
  it('adds the owner signature', async () => {
    const { bob, alice } = await usersFixture()
    const payment = new AddGatewayV1({
      owner: bob.address,
      gateway: alice.address,
    })

    const signedTxn = await payment.sign({ owner: bob })

    if (!signedTxn.ownerSignature) throw new Error('null')
    expect(Buffer.byteLength(Buffer.from(signedTxn.ownerSignature))).toBe(64)
  })

  it('adds the gateway signature', async () => {
    const { bob, alice } = await usersFixture()
    const payment = new AddGatewayV1({
      owner: bob.address,
      gateway: alice.address,
    })

    const signedTxn = await payment.sign({ gateway: alice })

    if (!signedTxn.gatewaySignature) throw new Error('null')

    expect(Buffer.byteLength(Buffer.from(signedTxn.gatewaySignature))).toBe(64)

    const paymentString = signedTxn.toString()
    const deserialized = AddGatewayV1.fromString(paymentString)
    expect(deserialized.owner?.b58).toBe(signedTxn.owner?.b58)
    expect(deserialized.payer?.b58).toBe(signedTxn.payer?.b58)
    expect(deserialized.gateway?.b58).toBe(signedTxn.gateway?.b58)
    expect(deserialized.fee).toBe(signedTxn.fee)
    expect(deserialized.stakingFee).toBe(signedTxn.stakingFee)
    expect(deserialized.ownerSignature).toEqual(signedTxn.ownerSignature)
    expect(deserialized.payerSignature).toEqual(signedTxn.payerSignature)
    expect(deserialized.gatewaySignature).toEqual(signedTxn.gatewaySignature)
  })

  it('adds the payer signature', async () => {
    const { bob, alice } = await usersFixture()
    const payment = new AddGatewayV1({
      owner: bob.address,
      gateway: alice.address,
      payer: bob.address,
    })

    const signedTxn = await payment.sign({ payer: alice })

    if (!signedTxn.payerSignature) throw new Error('null')

    expect(Buffer.byteLength(Buffer.from(signedTxn.payerSignature))).toBe(64)

    const paymentString = signedTxn.toString()
    const deserialized = AddGatewayV1.fromString(paymentString)
    expect(deserialized.owner?.b58).toBe(signedTxn.owner?.b58)
    expect(deserialized.payer?.b58).toBe(signedTxn.payer?.b58)
    expect(deserialized.gateway?.b58).toBe(signedTxn.gateway?.b58)
    expect(deserialized.fee).toBe(signedTxn.fee)
    expect(deserialized.stakingFee).toBe(signedTxn.stakingFee)
    expect(deserialized.ownerSignature).toEqual(signedTxn.ownerSignature)
    expect(deserialized.payerSignature).toEqual(signedTxn.payerSignature)
    expect(deserialized.gatewaySignature).toEqual(signedTxn.gatewaySignature)
  })
})
