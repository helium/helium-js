import { AddGatewayV1 } from '..'
import {
  usersFixture,
  bobB58,
  aliceB58,
} from '../../../../integration_tests/fixtures/users'

const addGatewayFixture = async () => {
  const { bob, alice } = await usersFixture()

  return new AddGatewayV1({
    owner: bob.address,
    gateway: alice.address,
    fee: 3,
    stakingFee: 100,
    ownerSignature: "bob's signature",
    gatewaySignature: "alice's signature",
  })
}

test('create an add gateway txn', async () => {
  const addGw = await addGatewayFixture()
  expect(addGw.owner?.b58).toBe(bobB58)
  expect(addGw.gateway?.b58).toBe(aliceB58)
  expect(addGw.fee).toBe(3)
  expect(addGw.stakingFee).toBe(100)
  expect(addGw.ownerSignature).toBe("bob's signature")
  expect(addGw.gatewaySignature).toBe("alice's signature")
})

describe('serialize', () => {
  it('serializes an add gw txn', async () => {
    const txn = await addGatewayFixture()
    expect(txn.serialize().length).toBe(112)
  })

  it('serializes to base64 string', async () => {
    const txn = await addGatewayFixture()
    expect(txn.toString()).toBe(
      'Cm4KIQE1GnHCL+/sIjGTatKCayF+zjnZ93/GxJY5kmKZw4aSlRIhAZxlnXI8wegQpy54996vRzaofxDvj8/IAQC1Myfn7kmkGg9ib2IncyBzaWduYXR1cmUiEWFsaWNlJ3Mgc2lnbmF0dXJlOGRAAw==',
    )
  })
})

describe('sign', () => {
  it('adds the owner signature', async () => {
    const { bob, alice } = await usersFixture()
    const payment = new AddGatewayV1({
      owner: bob.address,
      gateway: alice.address,
      fee: 3,
      stakingFee: 100,
    })

    const signedPayment = await payment.sign({ owner: bob })

    if (!signedPayment.ownerSignature) throw new Error('null')

    expect(Buffer.from(signedPayment.ownerSignature).toString('base64')).toBe(
      'YFAAIdy06QP8YbN7RWDZllLYNA6dK2iBn2N7UvVX/lV9teMkyEg8weiw9uU8Bt/dwSw+puvXO7lLg0ux7JvXBw==',
    )
  })

  it('adds the gateway signature', async () => {
    const { bob, alice } = await usersFixture()
    const payment = new AddGatewayV1({
      owner: bob.address,
      gateway: alice.address,
      fee: 3,
      stakingFee: 100,
    })

    const signedPayment = await payment.sign({ gateway: alice })

    if (!signedPayment.gatewaySignature) throw new Error('null')

    expect(Buffer.from(signedPayment.gatewaySignature).toString('base64')).toBe(
      'Si9IANAFXBYV/PDZK9Fzya/+yT26kYIdAqO0dqaO/H4jDL9svrfTYNUTEpWHRGk9kF8Y4Zv+YvQva2C7gyGmDw==',
    )
  })

  it('adds the payer signature', async () => {
    const { bob, alice } = await usersFixture()
    const payment = new AddGatewayV1({
      owner: bob.address,
      gateway: alice.address,
      payer: bob.address,
      fee: 3,
      stakingFee: 100,
    })

    const signedPayment = await payment.sign({ payer: alice })

    if (!signedPayment.payerSignature) throw new Error('null')

    expect(Buffer.from(signedPayment.payerSignature).toString('base64')).toBe(
      '2ybzlcc6pge6kL9aHYPBCOCIRlmAGx7//T8CY1MAyINHRxDLJ36is7HG2hw8xArbcCPvPydYY0LWaWI7dqppBA==',
    )
  })
})
