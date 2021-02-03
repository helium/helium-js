import proto from '@helium/proto'
import { TokenBurnV1, Transaction } from '..'
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

const tokenBurnFixture = async () => {
  const { bob, alice } = await usersFixture()

  return new TokenBurnV1({
    payer: bob.address,
    payee: alice.address,
    amount: 10,
    nonce: 1,
    memo: 'MTIzNDU2Nzg5MA==',
  })
}

test('create a token burn txn', async () => {
  const tokenBurn = await tokenBurnFixture()
  expect(tokenBurn.payer?.b58).toBe(bobB58)
  expect(tokenBurn.payee?.b58).toBe(aliceB58)
  expect(tokenBurn.amount).toBe(10)
  expect(tokenBurn.nonce).toBe(1)
  expect(tokenBurn.fee).toBe(35000)
  expect(tokenBurn.memo).toBe('MTIzNDU2Nzg5MA==')
  expect(tokenBurn.type).toBe('token_burn_v1')
})

describe('serialize', () => {
  it('serializes a payment txn', async () => {
    const tokenBurn = await tokenBurnFixture()
    expect(tokenBurn.serialize().length).toBeGreaterThan(0)
  })

  it('serializes to base64 string', async () => {
    const tokenBurn = await tokenBurnFixture()
    const burnString = tokenBurn.toString()
    // verify that we can decode it back from its serialized string
    const buf = Buffer.from(burnString, 'base64')
    const decoded = proto.helium.blockchain_txn.decode(buf)
    expect(decoded.tokenBurn?.amount?.toString()).toBe('10')
  })
})

describe('sign', () => {
  it('adds the payer signature', async () => {
    const { bob, alice } = await usersFixture()
    const tokenBurn = new TokenBurnV1({
      payer: bob.address,
      payee: alice.address,
      amount: 10,
      nonce: 1,
      memo: 'MTIzNDU2Nzg5MA==',
    })

    const signedPayment = await tokenBurn.sign({ payer: bob })

    if (!signedPayment.signature) throw new Error('null')

    expect(Buffer.byteLength(Buffer.from(signedPayment.signature))).toBe(64)
  })
})
