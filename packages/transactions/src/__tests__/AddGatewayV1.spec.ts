import proto from '@helium/proto'
import { AddGatewayV1, Transaction } from '..'
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

const addGatewayFixture = async () => {
  const { bob, alice } = await usersFixture()

  return new AddGatewayV1({
    owner: bob.address,
    gateway: alice.address,
  })
}

test('create an add gateway txn', async () => {
  const addGw = await addGatewayFixture()
  expect(addGw.owner?.b58).toBe(bobB58)
  expect(addGw.gateway?.b58).toBe(aliceB58)
  expect(addGw.fee).toBe(43750)
  expect(addGw.stakingFee).toBe(4000000)
})

describe('serialize', () => {
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
    expect(decoded.addGateway?.fee.toNumber()).toBe(43750)
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
  })
})
