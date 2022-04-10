import * as bs58 from 'bs58'
import { sha256 } from 'js-sha256'
import Address, { NetTypes } from '..'
import { bobB58, usersFixture } from '../../../../integration_tests/fixtures/users'

describe('bs58checkEncode', () => {
  it('should encode a publickey payload to b58 address', async () => {
    const { bob } = await usersFixture()
    const address = new Address(0, NetTypes.MAINNET, 1, bob.publicKey)
    const vPayload = Buffer.concat([Buffer.from([0]), address.bin])
    const checksum = sha256(Buffer.from(sha256.digest(vPayload)))
    const checksumBytes = Buffer.alloc(4, checksum, 'hex')
    const result = Buffer.concat([vPayload, checksumBytes])
    const encoded = bs58.encode(result)
    expect(encoded).toBe(bobB58)
  })
})

describe('bs58ToBin', () => {
  it('should carry a bs58 address to bin', async () => {
    const { bob } = await usersFixture()
    const address = new Address(0, NetTypes.MAINNET, 1, bob.publicKey).b58
    const bin = bs58.decode(address)
    const vPayload = bin.slice(0, -4)
    const checksum = Buffer.from(bin.slice(-4))
    const checksumVerify = sha256(Buffer.from(sha256.digest(vPayload)))
    const checksumVerifyBytes = Buffer.alloc(4, checksumVerify, 'hex')
    expect(checksumVerifyBytes).toStrictEqual(checksum)
  })
})
