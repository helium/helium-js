import { Keypair } from '@helium/crypto'
import { getUnixTime } from 'date-fns'
import {
  createLinkWalletCallbackUrl,
  createSignHotspotCallbackUrl,
  createUpdateHotspotUrl,
  createWalletLinkUrl,
  LinkWalletResponse,
  makeAppLinkAuthToken,
  parseWalletLinkToken,
  SignHotspotRequest,
  SignHotspotResponse,
  verifyWalletLinkToken,
} from '../index'

const createToken = async ({
  time,
  signingAppId,
} : { time?: number, signingAppId?: string } = {}) => {
  const keypair = await Keypair.makeRandom()
  const opts = {
    address: keypair.address.b58,
    appName: 'tacos',
    callbackUrl: 'myscheme://',
    requestAppId: 'com.tacos',
    signingAppId: signingAppId || 'com.burrito',
    time: time || new Date().getTime(),
  }
  const token = await makeAppLinkAuthToken(opts, keypair)
  return { token: parseWalletLinkToken(token), opts, tokenString: token }
}

describe('wallet-link', () => {
  describe('create link', () => {
    it('successfully creates and parses', async () => {
      const { token, opts } = await createToken()
      expect(token.address).toBe(opts.address)
      expect(token.signature).toBeDefined()
      expect(token.appName).toBe(opts.appName)
      expect(token.callbackUrl).toBe(opts.callbackUrl)
      expect(token.requestAppId).toBe(opts.requestAppId)
      expect(token.signingAppId).toBe(opts.signingAppId)
      expect(token.time).toBe(opts.time)
    })
  })

  describe('verify link', () => {
    it('validates token without opts', async () => {
      const { token } = await createToken()
      const verified = await verifyWalletLinkToken(token)
      expect(verified).toBe(true)
    })

    it('validates token with max age', async () => {
      const { token } = await createToken()
      const verified = await verifyWalletLinkToken(token, { maxAgeInSeconds: 60 })
      expect(verified).toBe(true)
    })

    it('invalidates expired token', async () => {
      const { token } = await createToken({ time: getUnixTime(new Date()) - 60 })
      expect(() => verifyWalletLinkToken(token, { maxAgeInSeconds: 30 })).toThrow('Token is expired')
    })
  })

  describe('create urls', () => {
    it('creates wallet link url', async () => {
      const params = {
        requestAppId: 'testRequestAppId',
        callbackUrl: 'testCallbackUrl',
        appName: 'testAppName',
        universalLink: 'testUniversalLink',
        path: 'testPath',
      }
      const callbackUrl = createWalletLinkUrl(params)
      expect(callbackUrl).toBe('testUniversalLinktestPath?appName=testAppName&callbackUrl=testCallbackUrl'
        + '&requestAppId=testRequestAppId')
    })

    it('creates callback url', async () => {
      const params: LinkWalletResponse = {
        status: 'success',
        token: 'testToken',
      }
      const callbackUrl = createLinkWalletCallbackUrl('test://', 'testAddress', params)
      expect(callbackUrl).toBe('test://link_wallet/testAddress?status=success&token=testToken')
    })

    it('creates sign hotspot callback url', async () => {
      const params: SignHotspotResponse = {
        status: 'success',
        assertTxn: 'testAssertTxn',
        gatewayTxn: 'testGatewayTxn',
        transferTxn: 'testTransferTxn',
        gatewayAddress: 'testGatewayAddress',
      }
      const callbackUrl = createSignHotspotCallbackUrl('test://', params)
      expect(callbackUrl).toBe('test://sign_hotspot?assertTxn=testAssertTxn&gatewayAddress=testGatewayAddress'
        + '&gatewayTxn=testGatewayTxn&status=success&transferTxn=testTransferTxn')
    })

    it('creates ios update hotspot url', async () => {
      const { tokenString } = await createToken({ signingAppId: 'com.helium.wallet.app' })
      const params: SignHotspotRequest = {
        token: tokenString,
        addGatewayTxn: 'testAddGatewayTxn',
        assertLocationTxn: 'testAssertLocationTxn',
        transferHotspotTxn: 'testTransferHotspotTxn',
        platform: 'ios',
      }
      const callbackUrl = createUpdateHotspotUrl(params)
      expect(callbackUrl).toBe('https://wallet.helium.com/sign_hotspot?addGatewayTxn=testAddGatewayTxn'
        + `&assertLocationTxn=testAssertLocationTxn&platform=ios&token=${encodeURIComponent(tokenString)}`
        + '&transferHotspotTxn=testTransferHotspotTxn')
    })

    it('creates android update hotspot url', async () => {
      const { tokenString } = await createToken({ signingAppId: 'com.helium.wallet.app' })
      const params: SignHotspotRequest = {
        token: tokenString,
        addGatewayTxn: 'testAddGatewayTxn',
        assertLocationTxn: 'testAssertLocationTxn',
        transferHotspotTxn: 'testTransferHotspotTxn',
        platform: 'android',
      }
      const callbackUrl = createUpdateHotspotUrl(params)
      expect(callbackUrl).toBe('https://wallet.helium.com/sign_hotspot?addGatewayTxn=testAddGatewayTxn'
        + `&assertLocationTxn=testAssertLocationTxn&platform=android&token=${encodeURIComponent(tokenString)}`
        + '&transferHotspotTxn=testTransferHotspotTxn')
    })

    it('fails for invalid platform', async () => {
      const { tokenString } = await createToken({ signingAppId: 'com.helium.wallet.app' })
      const params: SignHotspotRequest = {
        token: tokenString,
        addGatewayTxn: 'testAddGatewayTxn',
        assertLocationTxn: 'testAssertLocationTxn',
        transferHotspotTxn: 'testTransferHotspotTxn',
        platform: 'test',
      }
      expect(() => createUpdateHotspotUrl(params)).toThrow("Platform 'test' is not supported")
    })

    it('fails for invalid signing app id', async () => {
      const { tokenString } = await createToken()
      const params: SignHotspotRequest = {
        token: tokenString,
        addGatewayTxn: 'testAddGatewayTxn',
        assertLocationTxn: 'testAssertLocationTxn',
        transferHotspotTxn: 'testTransferHotspotTxn',
        platform: 'android',
      }
      expect(() => createUpdateHotspotUrl(params)).toThrow('Could not find delegate app')
    })
  })
})
