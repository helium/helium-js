import proto from '@helium/proto'
import { SecurityExchangeV1, Transaction } from '..'
import { usersFixture, bobB58, aliceB58 } from '../../../../integration_tests/fixtures/users'

Transaction.config({
  txnFeeMultiplier: 5000,
  dcPayloadSize: 24,
  stakingFeeTxnAddGatewayV1: 40 * 100000,
  stakingFeeTxnAssertLocationV1: 10 * 100000,
})

const fixture = async () => {
  const { bob, alice } = await usersFixture()

  return new SecurityExchangeV1({
    payer: bob.address,
    payee: alice.address,
    amount: 10,
    nonce: 1,
  })
}

test('create a security exchange txn', async () => {
  const txn = await fixture()
  expect(txn.payer?.b58).toBe(bobB58)
  expect(txn.payee?.b58).toBe(aliceB58)
  expect(txn.amount).toBe(10)
  expect(txn.nonce).toBe(1)
  expect(txn.fee).toBe(30000)
  expect(txn.type).toBe('security_exchange_v1')
})

describe('serialize', () => {
  it('serializes a security exchange txn', async () => {
    const txn = await fixture()
    expect(txn.serialize().length).toBeGreaterThan(0)
  })

  it('serializes to base64 string', async () => {
    const txn = await fixture()
    const txnString = txn.toString()
    // verify that we can decode it back from its serialized string
    const buf = Buffer.from(txnString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    expect(decoded.securityExchange?.amount?.toString()).toBe('10')
  })
})

describe('sign', () => {
  it('adds the payer signature', async () => {
    const { bob, alice } = await usersFixture()
    const txn = new SecurityExchangeV1({
      payer: bob.address,
      payee: alice.address,
      amount: 10,
      nonce: 1,
    })

    const signedTxn = await txn.sign({ payer: bob })

    if (!signedTxn.signature) throw new Error('null')

    expect(Buffer.byteLength(Buffer.from(signedTxn.signature))).toBe(64)
  })
})

describe('fees', () => {
  it('does not calculate fees if a fee is provided in the constructor', async () => {
    const { bob, alice } = await usersFixture()

    const txn = new SecurityExchangeV1({
      payer: bob.address,
      payee: alice.address,
      amount: 10,
      fee: 70000,
      nonce: 1,
    })

    expect(txn.fee).toBe(70000)
  })
})
