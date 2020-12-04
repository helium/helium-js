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
  })
}

test('create a transfer hotspot txn', async () => {
  const transferHotspot = await transferHotspotFixture()
  expect(transferHotspot.gateway?.b58).toBe(aliceB58)
  expect(transferHotspot.buyer?.b58).toBe(bobB58)
  expect(transferHotspot.seller?.b58).toBe(aliceB58)
  expect(transferHotspot.amountToSeller).toBe(10)
  expect(transferHotspot.buyerNonce).toBe(1)
  expect(transferHotspot.fee).toBe(35000)
})

describe('serialize', () => {
  it('serializes a transfer hotspot txn', async () => {
    const transferHotspot = await transferHotspotFixture()
    expect(transferHotspot.serialize().length).toBeGreaterThan(0)
  })

  it('serializes to base64 string', async () => {
    const transferHotspot = await transferHotspotFixture()
    const burnString = transferHotspot.toString()
    // verify that we can decode it back from its serialized string
    const buf = Buffer.from(burnString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    expect(decoded.transferHotspot?.amount_to_seller?.toString()).toBe('10')
  })
})

describe('sign', () => {
  it('adds the seller signature', async () => {
    const { alice } = await usersFixture()
    const transferHotspot = await transferHotspotFixture()
    const signedPayment = await transferHotspot.sign({ seller: alice })
    if (!signedPayment.sellerSignature) throw new Error('null')
    expect(Buffer.byteLength(Buffer.from(signedPayment.sellerSignature))).toBe(64)
  })

  it('adds the buyer signature', async () => {
    const { bob } = await usersFixture()
    const transferHotspot = await transferHotspotFixture()
    const signedPayment = await transferHotspot.sign({ buyer: bob })
    if (!signedPayment.buyerSignature) throw new Error('null')
    expect(Buffer.byteLength(Buffer.from(signedPayment.buyerSignature))).toBe(64)
  })
})
