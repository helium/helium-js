import { Keypair } from '@helium/crypto'
import Payment from '../Payment'

const paymentFixture = () => new Payment({
  payer: 'bob',
  payee: 'alice',
  amount: 10,
  fee: 0,
  nonce: 1,
  signature: "bob's signature",
})

test('create a payment txn', () => {
  const payment = paymentFixture()
  expect(payment.payer).toBe('bob')
  expect(payment.payee).toBe('alice')
  expect(payment.amount).toBe(10)
  expect(payment.fee).toBe(0)
  expect(payment.nonce).toBe(1)
  expect(payment.signature).toBe("bob's signature")
})

describe('serialize', () => {
  it('serializes a payment txn', () => {
    const payment = paymentFixture()
    expect(payment.serialize().length).toBe(26)
  })

  it('serializes to base64 string', () => {
    const payment = paymentFixture()
    expect(payment.toString()).toBe('CgJuhhIDalicGAogACgBMgluhuyyKCdq26s=')
  })
})

const bobWords = [
  'indicate', 'flee',
  'grace', 'spirit',
  'trim', 'safe',
  'access', 'oppose',
  'void', 'police',
  'calm', 'energy',
]

const aliceWords = [
  'trash', 'speed',
  'marriage', 'dress',
  'match', 'nerve',
  'govern', 'fence',
  'celery', 'fiction',
  'myth', 'gym',
]

describe('sign', () => {
  it('adds the payer signature', async () => {
    const bob = await Keypair.fromWords(bobWords)
    const alice = await Keypair.fromWords(aliceWords)
    const payment = new Payment({
      payer: bob.address,
      payee: alice.address,
      amount: 10,
      fee: 0,
      nonce: 1,
    })

    const signedPayment = await payment.sign({ payer: bob })

    expect(signedPayment.signature).toBe('9YK7m+V42f8zX2qsfYxYnMYWUzj4/jnEx+vcNqyP2IBOczsJuTY0nCQocs7hknRHA40qHPX8KVskrrpRx9D1AAom13M8dUbxymE3xtiAXszRkGMmezMhBS8Li7wEsMojLdb4Sdxc4wcSJtePHfCk0XCgOSSj3pAXChXeCn76a7xUaYxrYr4bZkZp2fDBWJz9GAogACgB')
  })
})
