import proto from '@helium/proto'
import { TransferValidatorStakeV1, Transaction } from '..'
import { usersFixture, bobB58, aliceB58 } from '../../../../integration_tests/fixtures/users'

Transaction.config({
  txnFeeMultiplier: 5000,
  dcPayloadSize: 24,
  stakingFeeTxnAddGatewayV1: 40 * 100000,
  stakingFeeTxnAssertLocationV1: 10 * 100000,
})

const stakeFixture = async () => {
  const { bob, alice } = await usersFixture()

  return new TransferValidatorStakeV1({
    oldAddress: bob.address,
    newAddress: alice.address,
    oldOwner: bob.address,
    newOwner: alice.address,
    stakeAmount: 10,
    paymentAmount: 20,
  })
}

test('create a transfer validator stake txn', async () => {
  const txn = await stakeFixture()
  expect(txn.oldAddress?.b58).toBe(bobB58)
  expect(txn.newAddress?.b58).toBe(aliceB58)
  expect(txn.oldOwner?.b58).toBe(bobB58)
  expect(txn.newOwner?.b58).toBe(aliceB58)
  expect(txn.stakeAmount).toBe(10)
  expect(txn.paymentAmount).toBe(20)
  expect(txn.fee).toBe(60000)
  expect(txn.type).toBe('transfer_validator_stake_v1')
})

describe('serialize', () => {
  it('serializes a transfer validator stake txn', async () => {
    const txn = await stakeFixture()
    expect(txn.serialize().length).toBeGreaterThan(0)
  })

  it('serializes to base64 string', async () => {
    const txn = await stakeFixture()
    const txnString = txn.toString()
    // verify that we can decode it back from its serialized string
    const buf = Buffer.from(txnString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    expect(decoded.transferValStake?.stakeAmount?.toString()).toBe('10')
  })
})

describe('sign', () => {
  it('adds the owner signatures', async () => {
    const { bob, alice } = await usersFixture()
    const txn = new TransferValidatorStakeV1({
      oldAddress: bob.address,
      newAddress: alice.address,
      oldOwner: bob.address,
      newOwner: alice.address,
      stakeAmount: 10,
    })

    const signedTxn = await txn.sign({ oldOwner: bob, newOwner: alice })

    if (!signedTxn.oldOwnerSignature) throw new Error('null')
    if (!signedTxn.newOwnerSignature) throw new Error('null')

    expect(Buffer.byteLength(Buffer.from(signedTxn.oldOwnerSignature))).toBe(64)
    expect(Buffer.byteLength(Buffer.from(signedTxn.newOwnerSignature))).toBe(64)
  })
})

describe('fees', () => {
  it('does not calculate fees if a fee is provided in the constructor', async () => {
    const { bob, alice } = await usersFixture()

    const txn = new TransferValidatorStakeV1({
      oldAddress: bob.address,
      newAddress: alice.address,
      oldOwner: bob.address,
      newOwner: alice.address,
      stakeAmount: 10,
      fee: 70000,
    })

    expect(txn.fee).toBe(70000)
  })
})
