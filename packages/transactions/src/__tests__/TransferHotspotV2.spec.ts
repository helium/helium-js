import proto from '@helium/proto'
import { TransferHotspotV2, Transaction } from '..'
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

  return new TransferHotspotV2({
    gateway: alice.address,
    owner: alice.address,
    ownerSignature: await alice.sign('ownerSignature'),
    newOwner: bob.address,
    nonce: 1,
  })
}

test('create a transfer hotspot v2 txn', async () => {
  const transferHotspot = await transferHotspotFixture()
  expect(transferHotspot.gateway?.b58).toBe(aliceB58)
  expect(transferHotspot.newOwner?.b58).toBe(bobB58)
  expect(transferHotspot.owner?.b58).toBe(aliceB58)
  expect(transferHotspot.nonce).toBe(1)
  expect(transferHotspot.fee).toBe(40000)
  expect(transferHotspot.type).toBe('transfer_hotspot_v2')
})

describe('serialize and deserialize', () => {
  it('serializes a transfer hotspot v2 txn', async () => {
    const transferHotspot = await transferHotspotFixture()
    expect(transferHotspot.serialize().length).toBeGreaterThan(0)
  })

  it('serializes to base64 string', async () => {
    const transferHotspot = await transferHotspotFixture()
    const transferHotspotString = transferHotspot.toString()
    // verify that we can decode it back from its serialized string
    const buf = Buffer.from(transferHotspotString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    expect(decoded.transferHotspotV2?.nonce?.toString()).toBe('1')
  })

  it('deserializes from a base64 string', async () => {
    const transferHotspot = await transferHotspotFixture()
    const transferHotspotString = transferHotspot.toString()
    const deserialized = TransferHotspotV2.fromString(transferHotspotString)
    expect(deserialized.gateway?.b58).toBe(transferHotspot.gateway?.b58)
    expect(deserialized.newOwner?.b58).toBe(transferHotspot.newOwner?.b58)
    expect(deserialized.owner?.b58).toBe(transferHotspot.owner?.b58)
    expect(deserialized.nonce).toBe(transferHotspot.nonce)
    expect(deserialized.fee).toBe(transferHotspot.fee)
    expect(deserialized.ownerSignature).toEqual(transferHotspot.ownerSignature)
  })
})

describe('sign', () => {
  it('adds the owner signature', async () => {
    const { alice } = await usersFixture()
    const transferHotspot = await transferHotspotFixture()
    const signedTxn = await transferHotspot.sign({ owner: alice })
    if (!signedTxn.ownerSignature) throw new Error('null')
    expect(Buffer.byteLength(Buffer.from(signedTxn.ownerSignature))).toBe(64)
  })
})
