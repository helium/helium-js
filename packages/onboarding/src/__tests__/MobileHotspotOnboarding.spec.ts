import MobileHotspotOnboarding from '../MobileHotspotOnboarding'
import { heliumAddressToSolPublicKey } from '@helium/spl-utils'
import { Transaction } from '@solana/web3.js'
import h3 from 'h3-js'
import { usersFixture } from '../../../../integration_tests/fixtures/users'
import { v4 as uuidv4 } from 'uuid'
import Address from '@helium/address'

const ALICE = Address.fromB58('148d8KTRcKA5JKPekBcKFd4KfvprvFRpjGtivhtmRmnZ8MFYnP3')
const ALICE_PUBKEY = heliumAddressToSolPublicKey(ALICE.b58)

describe('Wifi Onboarding with wifi api version 2 (default)', () => {
  it('Creates, signs, and send config message', async () => {
    const { alice } = await usersFixture()
    const client = new MobileHotspotOnboarding({
      wifiApiVersion: 'v2',
      shouldMock: true,
      wifiBaseUrl: 'http://192.168.68.1:3333',
      wallet: heliumAddressToSolPublicKey(alice.address.b58),
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
    const { txn } = await client.signGatewayAddTransaction('HeliumMobileOutdoor')
    if (!txn.gateway?.b58) throw new Error('no gateway b58')

    let lat = 44.501341
    let lng = -88.062208

    const originalMessage = await client.createConfigurationMessage({
      lat,
      lng,
      heightInMeters: 100,
      azimuth: 240,
      heightType: 'MSL',
      hotspotAddress: txn.gateway.b58,
    })

    const signature = await alice.sign(originalMessage)

    const response = await client.sendConfigurationMessage({
      hotspotAddress: txn.gateway.b58,
      originalMessage,
      signedMessage: signature,
      token: 'asdf',
      vendorSlug: 'rakwireless',
    })
    expect(response.status).toBe(204)
  })

  it('Gets the gps data from an outdoor hotspot', async () => {
    const client = new MobileHotspotOnboarding({
      wifiApiVersion: 'v2',
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

    const response = await client.getGpsLocation('HeliumMobileOutdoor')
    expect(response.success).toBe(false)
    const response2 = await client.getGpsLocation('HeliumMobileOutdoor')
    expect(response2.success).toBe(true)
  })

  it('Checks for valid firmware', async () => {
    const client = new MobileHotspotOnboarding({
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

  it('Checks for invalid firmware', async () => {
    const client = new MobileHotspotOnboarding({
      shouldMock: true,
      wifiBaseUrl: 'http://192.168.68.1:3333',
      wallet: ALICE_PUBKEY,
      onboardingClientUrl: 'https://onboarding.web.test-helium.com/api/v3',
      rpcEndpoint: 'https://api.devnet.solana.com',
      cluster: 'devnet',
    })

    const isValid = await client.checkFwValid('2.5.0')
    expect(isValid).toBeFalsy()
  })

  it('Fetches the add gateway txn from the wifi access point', async () => {
    const client = new MobileHotspotOnboarding({
      shouldMock: true,
      wifiBaseUrl: 'http://192.168.68.1:3333',
      wallet: ALICE_PUBKEY,
      onboardingClientUrl: 'https://onboarding.web.test-helium.com/api/v3',
      rpcEndpoint: 'https://api.devnet.solana.com',
      cluster: 'devnet',
    })

    const { txn } = await client.signGatewayAddTransaction('HeliumMobileIndoor')
    expect(txn).toBeDefined()
    expect(txn.owner?.b58).toBe(ALICE.b58)
  })

  it('Fetches the gateway update information', async () => {
    const client = new MobileHotspotOnboarding({
      shouldMock: true,
      wifiBaseUrl: 'http://192.168.68.1:3333',
      wallet: ALICE_PUBKEY,
      onboardingClientUrl: 'https://onboarding.web.test-helium.com/api/v3',
      rpcEndpoint: 'https://api.devnet.solana.com',
      cluster: 'devnet',
    })

    const assertData = await client.getUpdateMetaData({
      gateway: 'asdf',
      location: 'asdf123',
      networkType: 'MOBILE',
    })

    expect(assertData).toBeDefined()
    expect(assertData.hasSufficientBalance).toBe(true)
  })

  it('Creates and onboards a mobile wifi access point', async () => {
    const client = new MobileHotspotOnboarding({
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

    const { txn } = await client.signGatewayAddTransaction('HeliumMobileIndoor')
    let lat = 44.501341
    let lng = -88.062208

    const location = h3.latLngToCell(lat, lng, 12)
    const txns = await client.createHotspotGetOnboardTxns({
      addGatewayTxn: txn.toString(),
      deviceType: 'WifiIndoor',
      location,
      batch: 'example-batch',
      heliumSerial: uuidv4(),
      macEth0: uuidv4(),
      macWlan0: uuidv4(),
      rpiSerial: uuidv4(),
    })

    expect(txns).toBeDefined()

    const signed = txns.map((txn) => {
      const t = Transaction.from(Buffer.from(txn, 'base64'))
      return t.serialize({ verifySignatures: false })
    })

    const { txnIds } = await client.submitAndCompleteOnboarding({
      hotspotAddress: txn.gateway?.b58!,
      signedTxns: signed,
      deviceType: 'WifiIndoor',
    })

    expect(txnIds).toBeDefined()
  })
})

describe('Wifi Onboarding with wifi api version 1 (default)', () => {
  it('Checks for valid firmware', async () => {
    const client = new MobileHotspotOnboarding({
      wifiApiVersion: 'v1',
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
    const client = new MobileHotspotOnboarding({
      wifiApiVersion: 'v1',
      shouldMock: true,
      wifiBaseUrl: 'http://192.168.68.1:3333',
      wallet: ALICE_PUBKEY,
      onboardingClientUrl: 'https://onboarding.web.test-helium.com/api/v3',
      rpcEndpoint: 'https://api.devnet.solana.com',
      cluster: 'devnet',
    })

    const { txn } = await client.signGatewayAddTransaction('HeliumMobileIndoor')
    expect(txn).toBeDefined()
    expect(txn.owner?.b58).toBe(ALICE.b58)
  })

  it('Fetches the gateway location information', async () => {
    const client = new MobileHotspotOnboarding({
      wifiApiVersion: 'v1',
      shouldMock: true,
      wifiBaseUrl: 'http://192.168.68.1:3333',
      wallet: ALICE_PUBKEY,
      onboardingClientUrl: 'https://onboarding.web.test-helium.com/api/v3',
      rpcEndpoint: 'https://api.devnet.solana.com',
      cluster: 'devnet',
    })

    const assertData = await client.getUpdateMetaData({
      gateway: 'asdf',
      location: 'asdf123',
      networkType: 'MOBILE',
    })

    expect(assertData).toBeDefined()
    expect(assertData.hasSufficientBalance).toBe(true)
  })

  it('Creates and onboards a mobile wifi access point', async () => {
    const client = new MobileHotspotOnboarding({
      wifiApiVersion: 'v1',
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

    const { txn } = await client.signGatewayAddTransaction('HeliumMobileOutdoor')
    let lat = 44.501341
    let lng = -88.062208

    const location = h3.latLngToCell(lat, lng, 12)
    const txns = await client.createHotspotGetOnboardTxns({
      addGatewayTxn: txn.toString(),
      deviceType: 'WifiIndoor',
      location,
      batch: 'example-batch',
      heliumSerial: uuidv4(),
      macEth0: uuidv4(),
      macWlan0: uuidv4(),
      rpiSerial: uuidv4(),
    })

    expect(txns).toBeDefined()

    const signed = txns.map((txn) => {
      const t = Transaction.from(Buffer.from(txn, 'base64'))
      return t.serialize({ verifySignatures: false })
    })

    const { txnIds } = await client.submitAndCompleteOnboarding({
      hotspotAddress: txn.gateway?.b58!,
      signedTxns: signed,
      deviceType: 'WifiIndoor',
    })

    expect(txnIds).toBeDefined()
  })
})
