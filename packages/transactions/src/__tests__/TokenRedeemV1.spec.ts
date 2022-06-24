import proto from '@helium/proto'
import { Transaction, TokenRedeemV1, TokenType } from '..'
import { usersFixture, bobB58 } from '../../../../integration_tests/fixtures/users'

Transaction.config({
  txnFeeMultiplier: 5000,
  dcPayloadSize: 24,
  stakingFeeTxnAddGatewayV1: 40 * 100000,
  stakingFeeTxnAssertLocationV1: 10 * 100000,
})

const fixture = async () => {
  const { bob } = await usersFixture()

  return new TokenRedeemV1({
    tokenType: TokenType.mobile,
    account: bob.address,
    amount: 10,
    nonce: 1,
  })
}

test('create a token convert txn', async () => {
  const txn = await fixture()
  expect(txn.account?.b58).toBe(bobB58)
  expect(txn.amount).toBe(10)
  expect(txn.nonce).toBe(1)
  expect(txn.fee).toBe(25000)
  expect(txn.type).toBe('token_redeem_v1')
})

describe('serialize', () => {
  it('serializes a token convert txn', async () => {
    const txn = await fixture()
    expect(txn.serialize().length).toBeGreaterThan(0)
  })

  it('serializes to base64 string', async () => {
    const txn = await fixture()
    const txnString = txn.toString()
    // verify that we can decode it back from its serialized string
    const buf = Buffer.from(txnString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    expect(decoded.tokenRedeem?.amount?.toString()).toBe('10')
  })
})

describe('sign', () => {
  it('adds the signature', async () => {
    const { bob } = await usersFixture()
    const txn = await fixture()

    const signedTxn = await txn.sign({ keypair: bob })

    if (!signedTxn.signature) throw new Error('null')

    expect(Buffer.byteLength(Buffer.from(signedTxn.signature))).toBe(64)
  })
})

describe('fees', () => {
  it('does not calculate fees if a fee is provided in the constructor', async () => {
    const { bob } = await usersFixture()

    const txn = new TokenRedeemV1({
      tokenType: TokenType.mobile,
      account: bob.address,
      amount: 10,
      nonce: 1,
      fee: 70000,
    })

    expect(txn.fee).toBe(70000)
  })
})
