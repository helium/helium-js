import MobileWifiOnboarding from '../MobileWifiOnboarding'
import Address from '@helium/address'
import { heliumAddressToSolPublicKey } from '@helium/spl-utils'
import { Transaction } from '@solana/web3.js'
import h3 from 'h3-js'

const ALICE = Address.fromB58('148d8KTRcKA5JKPekBcKFd4KfvprvFRpjGtivhtmRmnZ8MFYnP3')
const ALICE_PUBKEY = heliumAddressToSolPublicKey(ALICE.b58)

const TEST_MAKER = {
  id: 1,
  name: 'Test Maker',
  address: '14PTUo6dRZoYheTrCLjGYUBVKKyvX7wDorwp6vkoeh1yQsDZkFm',
  locationNonceLimit: 2,
  createdAt: '2021-01-13T01:57:01.662Z',
  updatedAt: '2021-01-13T01:57:01.662Z',
}

const TEST_MAKER_PUBKEY = heliumAddressToSolPublicKey(TEST_MAKER.address)

describe('Wifi Onboarding', () => {
  it('Checks for valid firmware', async () => {
    const client = new MobileWifiOnboarding({
      shouldMock: true,
      wifiBaseUrl: 'http://192.168.68.1:3333',
      wallet: ALICE_PUBKEY,
      onboardingClientUrl: 'https://onboarding.web.test-helium.com/api/v3',
      rpcEndpoint: 'https://api.devnet.solana.com',
      cluster: 'devnet',
    })

    const isValid = await client.checkFwValid()
    expect(isValid).toBeTruthy()
  })

  it('Fetches the add gateway txn from the wifi access point', async () => {
    const client = new MobileWifiOnboarding({
      shouldMock: true,
      wifiBaseUrl: 'http://192.168.68.1:3333',
      wallet: ALICE_PUBKEY,
      onboardingClientUrl: 'https://onboarding.web.test-helium.com/api/v3',
      rpcEndpoint: 'https://api.devnet.solana.com',
      cluster: 'devnet',
    })

    const txn = await client.getAddGatewayTxn()
    expect(txn).toBeDefined()
    expect(txn.owner?.b58).toBe(ALICE.b58)
  })

  it('Fetches the gateway location information', async () => {
    const client = new MobileWifiOnboarding({
      shouldMock: true,
      wifiBaseUrl: 'http://192.168.68.1:3333',
      wallet: ALICE_PUBKEY,
      onboardingClientUrl: 'https://onboarding.web.test-helium.com/api/v3',
      rpcEndpoint: 'https://api.devnet.solana.com',
      cluster: 'devnet',
    })

    const assertData = await client.getMobileAssertData({
      gateway: 'asdf',
      location: 'asdf123',
      maker: TEST_MAKER_PUBKEY,
    })

    expect(assertData).toBeDefined()
    expect(assertData.hasSufficientBalance).toBe(true)
  })

  it('Creates and onboards a mobile wifi access point', async () => {
    const client = new MobileWifiOnboarding({
      shouldMock: true,
      wifiBaseUrl: 'http://192.168.68.1:3333',
      wallet: ALICE_PUBKEY,
      onboardingClientUrl: 'https://onboarding.web.test-helium.com/api/v3',
      cluster: 'devnet',
      rpcEndpoint: 'https://api.devnet.solana.com',
      logCallback: (message, data) => {
        console.log(message)
        if (data) {
          console.log(data)
        }
      },
      errorCallback: (error) => {
        console.log(error)
      },
      progressCallback: (progress, step) => {
        console.log(progress, step)
      },
    })

    const txn = await client.getAddGatewayTxn()
    let lat = 44.501341
    let lng = -88.062208

    const location = h3.latLngToCell(lat, lng, 12)
    const txns = await client.createHotspotGetOnboardTxns({
      addGatewayTxn: txn.toString(),
      location,
    })

    expect(txns).toBeDefined()

    const signed = txns.map((txn) => {
      const t = Transaction.from(Buffer.from(txn, 'base64'))
      return t.serialize({ verifySignatures: false })
    })

    const { txnIds } = await client.submitAndCompleteOnboarding({
      hotspotAddress: txn.gateway?.b58!,
      signedTxns: signed,
    })

    expect(txnIds).toBeDefined()
  })

  // TODO: Add test for firmware check...................
})
