import nock from 'nock'
import OnboardingClient from '..'
import { DEWI_ONBOARDING_API_BASE_URL_V3 } from '../types'

const HELIUM_MAKER = {
  id: 1,
  name: 'Helium Inc',
  address: '13daGGWvDQyTyHFDCPz8zDSVTWgPNNfJ4oh31Teec4TRWfjMx53',
  locationNonceLimit: 2,
  createdAt: '2021-01-13T01:57:01.662Z',
  updatedAt: '2021-01-13T01:57:01.662Z',
}

describe('Makers', () => {
  it('Fetches makers from the onboarding server', async () => {
    nock(DEWI_ONBOARDING_API_BASE_URL_V3)
      .get('/makers')
      .reply(200, {
        code: 200,
        data: [HELIUM_MAKER],
      })

    const client = new OnboardingClient(DEWI_ONBOARDING_API_BASE_URL_V3)
    const makers = await client.getMakers()
    const [helium] = makers.data!
    expect(helium).toBeDefined()
    expect(helium.name).toBe(HELIUM_MAKER.name)
    expect(helium.id).toBe(HELIUM_MAKER.id)
    expect(helium.locationNonceLimit).toBe(HELIUM_MAKER.locationNonceLimit)
    expect(helium.address).toBe(HELIUM_MAKER.address)
  })
})

describe('Hotspots', () => {
  it('Fetches a hotspot onboarding record', async () => {
    const hotspotAddress = '11xJMpks5xrSQjnvkAn9bP9kMk1rioTm63pNbacjvMXUksEqz69b'
    nock(DEWI_ONBOARDING_API_BASE_URL_V3)
      .get(`/hotspots/${hotspotAddress}`)
      .reply(200, {
        code: 200,
        data: {
          id: 13574,
          onboardingKey: '115AhJM1khXxNfk39NdpnEcVZX3RyXWn8UrPCXsTtekdkim1A7z',
          macWlan0: '60:81:f9:3d:ea:c2',
          rpiSerial: '0000011025222318',
          batch: 'cn',
          publicAddress: hotspotAddress,
          heliumSerial: 'HS1-12-Feb-2020-3268888535',
          macEth0: '60:81:f9:3d:ea:be',
          createdAt: '2020-08-05T18:11:29.000Z',
          updatedAt: '2020-11-09T20:27:47.000Z',
          makerId: HELIUM_MAKER.id,
          maker: HELIUM_MAKER,
        },
        success: true,
      })

    const client = new OnboardingClient(DEWI_ONBOARDING_API_BASE_URL_V3)
    const { data: record } = await client.getOnboardingRecord(hotspotAddress)
    expect(record).toBeDefined()
    expect(record?.publicAddress).toBe(hotspotAddress)
    expect(record?.maker.address).toBe(HELIUM_MAKER.address)
    expect(record?.makerId).toBe(HELIUM_MAKER.id)
  })

  it('Returns 404 when hotspot is not found', async () => {
    const hotspotAddress = '11xJMpks5xrSQjnvkAn9bP9kMk1rioTm63pNbacjvMXUksEqz69b'
    nock(DEWI_ONBOARDING_API_BASE_URL_V3).get(`/hotspots/${hotspotAddress}`).reply(404, {
      code: 404,
      errorMessage: 'Unable to find hotspot',
      errors: [],
      data: null,
      success: false,
    })

    const client = new OnboardingClient(DEWI_ONBOARDING_API_BASE_URL_V3, { retryOn404: false })
    const record = await client.getOnboardingRecord(hotspotAddress)
    expect(record).toBeDefined()
    expect(record.code).toBe(404)
    expect(record.errorMessage).toBe('Unable to find hotspot')
  })
})

describe('Payment', () => {
  it('Posts a payment transaction', async () => {
    const txn = 'asdfjklasdfjklasdfjklasfd'
    const hotspotAddress = '11xJMpks5xrSQjnvkAn9bP9kMk1rioTm63pNbacjvMXUksEqz69b'
    nock(DEWI_ONBOARDING_API_BASE_URL_V3)
      .post(`/transactions/pay/${hotspotAddress}`, { transaction: txn })
      .reply(200, {
        code: 200,
        data: {
          transaction: 'asdf1234',
        },
        success: true,
      })

    const client = new OnboardingClient(DEWI_ONBOARDING_API_BASE_URL_V3)
    const onboardingTxn = await client.postPaymentTransaction(hotspotAddress, txn)
    expect(onboardingTxn.data).toBeDefined()
    expect(onboardingTxn.data?.transaction).toBe('asdf1234')
  })

  it('Returns 404 when hotspot is not found', async () => {
    const hotspotAddress = '11xJMpks5xrSQjnvkAn9bP9kMk1rioTm63pNbacjvMXUksEqz69b'
    nock(DEWI_ONBOARDING_API_BASE_URL_V3).get(`/hotspots/${hotspotAddress}`).reply(404, {
      code: 404,
      errorMessage: 'Hotspot not found',
      errors: [],
      data: null,
      success: false,
    })

    const client = new OnboardingClient(DEWI_ONBOARDING_API_BASE_URL_V3, { retryOn404: false })
    const record = await client.getOnboardingRecord(hotspotAddress)
    expect(record).toBeDefined()
    expect(record.code).toBe(404)
    expect(record.errorMessage).toBe('Hotspot not found')
  })
})

describe('Firmware', () => {
  const version = '2019.11.06.0'
  it('Gets the firmware version', async () => {
    nock(DEWI_ONBOARDING_API_BASE_URL_V3).get('/firmware').reply(200, {
      code: 200,
      data: {
        version,
      },
      success: true,
    })

    const client = new OnboardingClient(DEWI_ONBOARDING_API_BASE_URL_V3)
    const onboardingTxn = await client.getFirmware()
    expect(onboardingTxn.data).toBeDefined()
    expect(onboardingTxn.data?.version).toBe(version)
  })
})

describe('Onboard', () => {
  it('Creates a hotspot transaction', async () => {
    nock(DEWI_ONBOARDING_API_BASE_URL_V3)
      .post('/transactions/create-hotspot')
      .reply(200, {
        code: 200,
        data: {
          solanaTransactions: [[0, 1, 2, 3, 4, 5]],
        },
        success: true,
      })

    const client = new OnboardingClient(DEWI_ONBOARDING_API_BASE_URL_V3)
    const onboardingTxn = await client.createHotspot({
      transaction: 'asdf',
    })
    expect(onboardingTxn.data).toBeDefined()
    expect(onboardingTxn.data?.solanaTransactions[0][0]).toBe(0)
  })

  it('Creates an iot hotspot onboard transaction', async () => {
    nock(DEWI_ONBOARDING_API_BASE_URL_V3)
      .post('/transactions/iot/onboard')
      .reply(200, {
        code: 200,
        data: {
          solanaTransactions: [[0, 1, 2, 3, 4, 5]],
        },
        success: true,
      })

    const client = new OnboardingClient(DEWI_ONBOARDING_API_BASE_URL_V3)
    const onboardingTxn = await client.onboardIot({
      location: '8a2a1072b59ffff',
      gain: 1,
      elevation: 1,
      hotspotAddress: 'asdf1234',
    })
    expect(onboardingTxn.data).toBeDefined()
    expect(onboardingTxn.data?.solanaTransactions[0][0]).toBe(0)
  })

  it('Create a mobile hotspot onboard transaction', async () => {
    nock(DEWI_ONBOARDING_API_BASE_URL_V3)
      .post('/transactions/mobile/onboard')
      .reply(200, {
        code: 200,
        data: {
          solanaTransactions: [[0, 1, 2, 3, 4, 5]],
        },
        success: true,
      })

    const client = new OnboardingClient(DEWI_ONBOARDING_API_BASE_URL_V3)
    const onboardingTxn = await client.onboardMobile({
      deploymentInfo: {
        wifiInfoV0: {
          elevation: 1,
          antenna: 1,
          azimuth: 1,
          electricalDownTilt: 1,
          mechanicalDownTilt: 1,
        },
      },
      location: '8a2a1072b59ffff',
      hotspotAddress: 'asdf1234',
    })
    expect(onboardingTxn.data).toBeDefined()
    expect(onboardingTxn.data?.solanaTransactions[0][0]).toBe(0)
  })

  describe('Assert', () => {
    it('Creates an update metadata transaction for iot hotspots', async () => {
      nock(DEWI_ONBOARDING_API_BASE_URL_V3)
        .post('/transactions/iot/update-metadata')
        .reply(200, {
          code: 200,
          data: {
            solanaTransactions: [[0, 1, 2, 3, 4, 5]],
          },
          success: true,
        })

      const client = new OnboardingClient(DEWI_ONBOARDING_API_BASE_URL_V3)
      const onboardingTxn = await client.updateIotMetadata({
        solanaAddress: 'asfd',
        location: '8a2a1072b59ffff',
        elevation: 1,
        gain: 1,
        hotspotAddress: 'asdf',
      })
      expect(onboardingTxn.data).toBeDefined()
      expect(onboardingTxn.data?.solanaTransactions[0][0]).toBe(0)
    })

    it('Creates an update metadata transaction for mobile hotspots', async () => {
      nock(DEWI_ONBOARDING_API_BASE_URL_V3)
        .post('/transactions/mobile/update-metadata')
        .reply(200, {
          code: 200,
          data: {
            solanaTransactions: [[0, 1, 2, 3, 4, 5]],
          },
          success: true,
        })

      const client = new OnboardingClient(DEWI_ONBOARDING_API_BASE_URL_V3)
      const onboardingTxn = await client.updateMobileMetadata({
        solanaAddress: 'asfd',
        location: '8a2a1072b59ffff',
        hotspotAddress: 'asdf',
        deploymentInfo: {
          wifiInfoV0: {
            elevation: 1,
            antenna: 1,
            azimuth: 1,
            electricalDownTilt: 1,
            mechanicalDownTilt: 1,
          },
        },
      })
      expect(onboardingTxn.data).toBeDefined()
      expect(onboardingTxn.data?.solanaTransactions[0][0]).toBe(0)
    })
  })
})
