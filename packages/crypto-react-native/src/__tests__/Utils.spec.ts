import { utils } from '..'

describe('deriveChecksumBits', () => {
  it('should generate a bip39 checksum from entropy', async () => {
    const entropy = '00000000000000000000000000000000'
    const entropyBuffer = Buffer.from(entropy, 'hex')
    const derivedChecksumBits = utils.deriveChecksumBits(entropyBuffer)
    expect(derivedChecksumBits).toStrictEqual('0011')
  })
})
