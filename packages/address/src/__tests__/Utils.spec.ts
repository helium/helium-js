import bs58 from 'bs58'
import { sha256 } from '@noble/hashes/sha2'
import Address, { NetTypes } from '..'
import { bobB58, usersFixture } from '../../../../integration_tests/fixtures/users'

describe('bs58checkEncode', () => {
  it('should encode a publickey payload to b58 address', async () => {
    const { bob } = await usersFixture()
    const address = new Address(0, NetTypes.MAINNET, 1, bob.publicKey)
    const vPayload = Buffer.concat([Buffer.from([0]), address.bin])
    const checksum = sha256(sha256(vPayload))
    const checksumBytes = Buffer.alloc(4, Buffer.from(checksum).toString('hex'), 'hex')
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
    const checksumVerify = sha256(sha256(vPayload))
    const checksumVerifyBytes = Buffer.alloc(4, Buffer.from(checksumVerify).toString('hex'), 'hex')
    expect(checksumVerifyBytes).toStrictEqual(checksum)
  })
})
