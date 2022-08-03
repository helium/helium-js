import proto from '@helium/proto'
import { utils } from '@helium/crypto'
import { Transaction, SubnetworkRewardsV1 } from '..'
import { usersFixture, bobB58, aliceB58 } from '../../../../integration_tests/fixtures/users'

Transaction.config({
  txnFeeMultiplier: 5000,
  dcPayloadSize: 24,
  stakingFeeTxnAddGatewayV1: 40 * 100000,
  stakingFeeTxnAssertLocationV1: 10 * 100000,
})

const fixture = async () => {
  const { bob, alice } = await usersFixture()

  return new SubnetworkRewardsV1({
    tokenType: 'mobile',
    startEpoch: 1000,
    endEpoch: 2000,
    rewards: [
      { account: bob.address, amount: 1000 }, { account: alice.address, amount: 2000 },
    ],

  })
}

test('create a subnetwork rewards txn', async () => {
  const txn = await fixture()
  expect(txn.tokenType).toBe('mobile')
  expect(txn.startEpoch).toBe(1000)
  expect(txn.endEpoch).toBe(2000)
  expect(txn.rewards.length).toBe(2)
  expect(txn.rewards[0].account.b58).toBe(bobB58)
  expect(txn.rewards[0].amount).toBe(1000)
  expect(txn.rewards[1].account.b58).toBe(aliceB58)
  expect(txn.rewards[1].amount).toBe(2000)
  expect(txn.type).toBe('subnetwork_rewards_v1')
})

describe('serialize', () => {
  it('serializes a subnetwork rewards txn', async () => {
    const txn = await fixture()
    expect(txn.serialize().length).toBeGreaterThan(0)
  })

  it('serializes to base64 string', async () => {
    const txn = await fixture()
    const txnString = txn.toString()
    // verify that we can decode it back from its serialized string
    const buf = Buffer.from(txnString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    expect(decoded.subnetworkRewards?.startEpoch?.toString()).toBe('1000')
  })
})

describe('fromString', () => {
  it('deserializes a txn from string', async () => {
    const txn = await fixture()
    const txnString = txn.toString()
    const decoded = SubnetworkRewardsV1.fromString(txnString)
    expect(decoded.tokenType).toBe('mobile')
    expect(decoded.startEpoch).toBe(1000)
    expect(decoded.endEpoch).toBe(2000)
    expect(decoded.rewards.length).toBe(2)
    expect(decoded.rewards[0].account.b58).toBe(bobB58)
    expect(decoded.rewards[0].amount).toBe(1000)
    expect(decoded.rewards[1].account.b58).toBe(aliceB58)
    expect(decoded.rewards[1].amount).toBe(2000)
    expect(decoded.type).toBe('subnetwork_rewards_v1')
  })
})

describe('sign', () => {
  it('adds the rewards signature', async () => {
    const { bob } = await usersFixture()
    const txn = await fixture()

    const signedTxn = await txn.sign({ keypair: bob })

    if (!signedTxn.rewardServerSignature) throw new Error('null')

    expect(Buffer.byteLength(Buffer.from(signedTxn.rewardServerSignature))).toBe(64)
  })

  it('verifies the signature', async () => {
    const { bob } = await usersFixture()
    const txn = await fixture()

    const signedTxn = await txn.sign({ keypair: bob })
    const rawTxn = signedTxn.toString()

    const subnetworkRewards = SubnetworkRewardsV1.fromString(rawTxn)
    const message = subnetworkRewards?.message()
    const signature = subnetworkRewards?.rewardServerSignature

    if (!signature || !message) {
      throw new Error('Token could not be created')
    }

    const valid = await utils.verify(signature, message, bob.publicKey)
    expect(valid).toBeTruthy()
  })
})
