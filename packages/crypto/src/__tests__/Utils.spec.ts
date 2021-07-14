import { utils, Address } from '..'
import { bobB58, usersFixture } from '../../../../integration_tests/fixtures/users'
import * as bs58 from 'bs58'
import { MAINNET } from '../NetType'


describe('deriveChecksumBits', () => {
  it('should generate a bip39 checksum from entropy', async () => {
    const entropy = '00000000000000000000000000000000'
    const entropyBuffer = Buffer.from(entropy, 'hex');
    const derivedChecksumBits = utils.deriveChecksumBits(entropyBuffer)
    expect(derivedChecksumBits).toStrictEqual('0011')
  })
})

describe('bs58checkEncode', () => {
  it('should encode a publickey payload to b58 address', async () => {
    const { bob } = await usersFixture()
    const address = new Address(0, MAINNET, 1, bob.publicKey)
  	const vPayload = Buffer.concat([Buffer.from([0]), address.bin])
    const checksum = utils.sha256(Buffer.from(utils.sha256(vPayload)))
  	const checksumBytes = Buffer.alloc(4, checksum, 'hex')
  	const result = Buffer.concat([vPayload, checksumBytes])
  	const encoded = bs58.encode(result)
  	expect(encoded).toBe(bobB58)
  })
})

describe('bs58ToBin', () => {
  it('should carry a bs58 address to bin', async () => {
    const { bob } = await usersFixture()
    const address = new Address(0, MAINNET, 1, bob.publicKey).b58
  	const bin = bs58.decode(address)
  	const vPayload = bin.slice(0, -4)
  	const checksum = bin.slice(-4)
  	const checksumVerify = utils.sha256(Buffer.from(utils.sha256(vPayload)))
  	const checksumVerifyBytes = Buffer.alloc(4, checksumVerify, 'hex')
  	expect(checksumVerifyBytes).toStrictEqual(checksum)
  })
})
