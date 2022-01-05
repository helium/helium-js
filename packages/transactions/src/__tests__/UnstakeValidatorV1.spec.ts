import proto from '@helium/proto'
import { UnstakeValidatorV1, Transaction } from '..'
import { usersFixture, bobB58, aliceB58 } from '../../../../integration_tests/fixtures/users'

Transaction.config({
  txnFeeMultiplier: 5000,
  dcPayloadSize: 24,
  stakingFeeTxnAddGatewayV1: 40 * 100000,
  stakingFeeTxnAssertLocationV1: 10 * 100000,
})

const stakeFixture = async () => {
  const { bob, alice } = await usersFixture()

  return new UnstakeValidatorV1({
    address: bob.address,
    owner: alice.address,
    stakeAmount: 10,
    stakeReleaseHeight: 100,
  })
}

test('create a stake validator txn', async () => {
  const txn = await stakeFixture()
  expect(txn.address?.b58).toBe(bobB58)
  expect(txn.owner?.b58).toBe(aliceB58)
  expect(txn.stakeAmount).toBe(10)
  expect(txn.stakeReleaseHeight).toBe(100)
  expect(txn.fee).toBe(30000)
  expect(txn.type).toBe('unstake_validator_v1')
})

describe('serialize', () => {
  it('serializes an unstake validator txn', async () => {
    const txn = await stakeFixture()
    expect(txn.serialize().length).toBeGreaterThan(0)
  })

  it('serializes to base64 string', async () => {
    const txn = await stakeFixture()
    const txnString = txn.toString()
    // verify that we can decode it back from its serialized string
    const buf = Buffer.from(txnString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    expect(decoded.unstakeValidator?.stakeAmount?.toString()).toBe('10')
  })
})

describe('sign', () => {
  it('adds the owner signature', async () => {
    const { bob, alice } = await usersFixture()
    const txn = new UnstakeValidatorV1({
      address: bob.address,
      owner: alice.address,
      stakeAmount: 10,
      stakeReleaseHeight: 100,
    })

    const signedTxn = await txn.sign({ owner: bob })

    if (!signedTxn.ownerSignature) throw new Error('null')

    expect(Buffer.byteLength(Buffer.from(signedTxn.ownerSignature))).toBe(64)
  })
})

describe('fees', () => {
  it('does not calculate fees if a fee is provided in the constructor', async () => {
    const { bob, alice } = await usersFixture()

    const txn = new UnstakeValidatorV1({
      address: bob.address,
      owner: alice.address,
      stakeAmount: 10,
      stakeReleaseHeight: 100,
      fee: 70000,
    })

    expect(txn.fee).toBe(70000)
  })
})
