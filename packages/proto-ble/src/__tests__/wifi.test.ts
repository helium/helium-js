import {
  wifi_connect_v1 as WifiConnectV1,
  wifi_services_v1 as WifiServicesV1,
  wifi_remove_v1 as WifiRemoveV1,
} from '../../build'

const wifiSSID = 'hotspot-wifi'
const wifiSSID2 = 'tacos'
const password = '!cilantro1983!'

describe('wifi_remove_v1', () => {
  it('can encode and decode', () => {
    const wifiRemove = WifiRemoveV1.create({
      service: wifiSSID,
    })

    const encoded = WifiRemoveV1.encode(wifiRemove).finish()
    const base64 = Buffer.from(encoded).toString('base64')
    expect(base64).toBe('Cgxob3RzcG90LXdpZmk=')
    const decoded = WifiRemoveV1.decode(encoded)
    expect(decoded.service).toEqual(wifiSSID)
  })
})

describe('wifi_services_v1', () => {
  it('can encode and decode', () => {
    const wifiServices = WifiServicesV1.create({
      services: [wifiSSID, wifiSSID2],
    })

    const encoded = WifiServicesV1.encode(wifiServices).finish()
    const base64 = Buffer.from(encoded).toString('base64')
    expect(base64).toBe('Cgxob3RzcG90LXdpZmkKBXRhY29z')
    const decoded = WifiServicesV1.decode(encoded)
    expect(decoded.services[0]).toEqual(wifiSSID)
    expect(decoded.services[1]).toEqual(wifiSSID2)
  })
})

describe('wifi_connect_v1', () => {
  it('can encode and decode', () => {
    const wifiServices = WifiConnectV1.create({
      service: wifiSSID,
      password,
    })

    const encoded = WifiConnectV1.encode(wifiServices).finish()
    const base64 = Buffer.from(encoded).toString('base64')
    expect(base64).toBe('Cgxob3RzcG90LXdpZmkSDiFjaWxhbnRybzE5ODMh')
    const decoded = WifiConnectV1.decode(encoded)
    expect(decoded.password).toEqual(password)
    expect(decoded.service).toEqual(wifiSSID)
  })
})
