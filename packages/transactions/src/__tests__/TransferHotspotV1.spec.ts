import proto from '@helium/proto'
import { TransferHotspotV1, Transaction } from '..'
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

const transferHotspotFixture = async () => {
  const { bob, alice } = await usersFixture()

  return new TransferHotspotV1({
    gateway: alice.address,
    buyer: bob.address,
    seller: alice.address,
    amountToSeller: 10,
    buyerNonce: 1,
    sellerSignature: await alice.sign('sellerSignature'),
    buyerSignature: await bob.sign('buyerSignature'),
  })
}

test('create a transfer hotspot txn', async () => {
  const transferHotspot = await transferHotspotFixture()
  expect(transferHotspot.gateway?.b58).toBe(aliceB58)
  expect(transferHotspot.buyer?.b58).toBe(bobB58)
  expect(transferHotspot.seller?.b58).toBe(aliceB58)
  expect(transferHotspot.amountToSeller).toBe(10)
  expect(transferHotspot.buyerNonce).toBe(1)
  expect(transferHotspot.fee).toBe(55000)
  expect(transferHotspot.type).toBe('transfer_hotspot_v1')
})

describe('serialize and deserialize', () => {
  it('serializes a transfer hotspot txn', async () => {
    const transferHotspot = await transferHotspotFixture()
    expect(transferHotspot.serialize().length).toBeGreaterThan(0)
  })

  it('serializes to base64 string', async () => {
    const transferHotspot = await transferHotspotFixture()
    const transferHotspotString = transferHotspot.toString()
    // verify that we can decode it back from its serialized string
    const buf = Buffer.from(transferHotspotString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    expect(decoded.transferHotspot?.amountToSeller?.toString()).toBe('10')
  })

  it('deserializes from a base64 string', async () => {
    const transferHotspot = await transferHotspotFixture()
    const transferHotspotString = transferHotspot.toString()
    const deserialized = TransferHotspotV1.fromString(transferHotspotString)
    expect(deserialized.gateway?.b58).toBe(transferHotspot.gateway?.b58)
    expect(deserialized.buyer?.b58).toBe(transferHotspot.buyer?.b58)
    expect(deserialized.seller?.b58).toBe(transferHotspot.seller?.b58)
    expect(deserialized.amountToSeller).toBe(transferHotspot.amountToSeller)
    expect(deserialized.buyerNonce).toBe(transferHotspot.buyerNonce)
    expect(deserialized.fee).toBe(transferHotspot.fee)
    expect(deserialized.sellerSignature).toEqual(transferHotspot.sellerSignature)
    expect(deserialized.buyerSignature).toEqual(transferHotspot.buyerSignature)
  })
})

describe('sign', () => {
  it('adds the seller signature', async () => {
    const { alice } = await usersFixture()
    const transferHotspot = await transferHotspotFixture()
    const signedTxn = await transferHotspot.sign({ seller: alice })
    if (!signedTxn.sellerSignature) throw new Error('null')
    expect(Buffer.byteLength(Buffer.from(signedTxn.sellerSignature))).toBe(64)
  })

  it('adds the buyer signature', async () => {
    const { bob } = await usersFixture()
    const transferHotspot = await transferHotspotFixture()
    const signedTxn = await transferHotspot.sign({ buyer: bob })
    if (!signedTxn.buyerSignature) throw new Error('null')
    expect(Buffer.byteLength(Buffer.from(signedTxn.buyerSignature))).toBe(64)
  })
})
