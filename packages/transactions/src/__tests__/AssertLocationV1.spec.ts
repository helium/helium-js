import { AssertLocationV1 } from '..'
import {
  usersFixture,
  bobB58,
  aliceB58,
} from '../../../../integration_tests/fixtures/users'

const assertLocationFixture = async () => {
  const { bob, alice } = await usersFixture()

  return new AssertLocationV1({
    owner: bob.address,
    gateway: alice.address,
    fee: 3,
    stakingFee: 100,
    ownerSignature: "bob's signature",
    gatewaySignature: "alice's signature",
    location: '8c383092841a7ff',
    nonce: 1,
  })
}

test('create an assert location txn', async () => {
  const txn = await assertLocationFixture()
  expect(txn.owner?.b58).toBe(bobB58)
  expect(txn.gateway?.b58).toBe(aliceB58)
  expect(txn.fee).toBe(3)
  expect(txn.stakingFee).toBe(100)
  expect(txn.ownerSignature).toBe("bob's signature")
  expect(txn.gatewaySignature).toBe("alice's signature")
  expect(txn.location).toBe('8c383092841a7ff')
  expect(txn.nonce).toBe(1)
})

describe('serialize', () => {
  it('serializes an add gw txn', async () => {
    const txn = await assertLocationFixture()
    expect(txn.serialize().length).toBe(132)
  })

  it('serializes to base64 string', async () => {
    const txn = await assertLocationFixture()
    expect(txn.toString()).toBe(
      'EoEBCiEBnGWdcjzB6BCnLnj33q9HNqh/EO+Pz8gBALUzJ+fuSaQSIQE1GnHCL+/sIjGTatKCayF+zjnZ93/GxJY5kmKZw4aSlSIRYWxpY2UncyBzaWduYXR1cmUqD2JvYidzIHNpZ25hdHVyZToPOGMzODMwOTI4NDFhN2ZmQAFIZFAD',
    )
  })
})

describe('sign', () => {
  it('adds the owner signature', async () => {
    const { bob, alice } = await usersFixture()
    const payment = new AssertLocationV1({
      owner: bob.address,
      gateway: alice.address,
      fee: 3,
      stakingFee: 100,
    })

    const signedPayment = await payment.sign({ owner: bob })

    if (!signedPayment.ownerSignature) throw new Error('null')

    expect(Buffer.from(signedPayment.ownerSignature).toString('base64')).toBe(
      'gltLk2u3hjx02W6qTf3REJLRtlylPvLl+b28Zcap4z6lEOeTWWKEimG1Jn4TdLMdFKkM42lzXdfbVoTpElfrCg==',
    )
  })

  it('adds the gateway signature', async () => {
    const { bob, alice } = await usersFixture()
    const payment = new AssertLocationV1({
      owner: bob.address,
      gateway: alice.address,
      fee: 3,
      stakingFee: 100,
    })

    const signedPayment = await payment.sign({ gateway: alice })

    if (!signedPayment.gatewaySignature) throw new Error('null')

    expect(Buffer.from(signedPayment.gatewaySignature).toString('base64')).toBe(
      'VXcKn6oApLNitnERfFWeo/REyssh8CzUwU9VWZaC4FiJc7He8vOiDhL4xwLV4g6MzwvWT9wvh0JUwcTX6jeEBw==',
    )
  })

  it('adds the payer signature', async () => {
    const { bob, alice } = await usersFixture()
    const payment = new AssertLocationV1({
      owner: bob.address,
      gateway: alice.address,
      payer: bob.address,
      fee: 3,
      stakingFee: 100,
    })

    const signedPayment = await payment.sign({ payer: alice })

    if (!signedPayment.payerSignature) throw new Error('null')

    expect(Buffer.from(signedPayment.payerSignature).toString('base64')).toBe(
      'xNRW4R+UiHD043zW0+56WH7iKNbeqHrc1aElmJb86QuQTuKmYa/iswExe/VI0GDrd6cuS7neODvgNbA4ieOqBw==',
    )
  })
})
