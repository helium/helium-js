import MobileWifiOnboarding from '../MobileWifiOnboarding'
import { AddGatewayV1 } from '@helium/transactions'
import Address from '@helium/address'

const ALICE = Address.fromB58('148d8KTRcKA5JKPekBcKFd4KfvprvFRpjGtivhtmRmnZ8MFYnP3')

const TEST_MAKER = {
  id: 1,
  name: 'Test Maker',
  address: '14PTUo6dRZoYheTrCLjGYUBVKKyvX7wDorwp6vkoeh1yQsDZkFm',
  locationNonceLimit: 2,
  createdAt: '2021-01-13T01:57:01.662Z',
  updatedAt: '2021-01-13T01:57:01.662Z',
}

describe('Wifi Onboarding', () => {
  it('Fetches the add gateway txn from the wifi access point', async () => {
    const client = new MobileWifiOnboarding({
      shouldMock: true,
      wifiBaseUrl: 'http://192.168.68.1:3333',
      ownerHeliumAddress: ALICE.b58,
      payerHeliumAddress: TEST_MAKER.address,
    })
    const txn: AddGatewayV1 = await client.getAddGatewayTxn()
    expect(txn).toBeDefined()
    expect(txn.payer?.b58).toBe(TEST_MAKER.address)
    expect(txn.owner?.b58).toBe(ALICE.b58)
  })
})
