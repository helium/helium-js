import { Keypair } from '@helium/crypto-react-native'
import { makeAppLinkAuthToken, parseWalletLinkToken } from '../index'

describe('wallet-link', () => {
  it('creates a wallet link', async () => {
    const keypair = await Keypair.makeRandom()
    const opts = {
      address: keypair.address.b58,
      appName: 'tacos',
      callbackUrl: 'myscheme://',
      requestAppId: 'com.tacos',
      signingAppId: 'com.burrito',
      time: new Date().getTime(),
    }
    const token = await makeAppLinkAuthToken(opts, keypair)
    const parsed = parseWalletLinkToken(token)
    expect(parsed.address).toBe(keypair.address.b58)
    const expectedSignature =
      'NKGpxhYtcXdyFDDRbbY5KjY7r38R8q1ViBft85t4QcH/WrB2Mg9bg2RocfYy16YGcxjLLNSwTLOmfxsjwPWdBQ=='
    expect(parsed.signature).toBe(expectedSignature)
    expect(parsed.appName).toBe(opts.appName)
    expect(parsed.callbackUrl).toBe(opts.callbackUrl)
    expect(parsed.requestAppId).toBe(opts.requestAppId)
    expect(parsed.signingAppId).toBe(opts.signingAppId)
    expect(parsed.time).toBe(opts.time)
  })
})
