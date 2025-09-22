import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry'
import MockAdapter from 'axios-mock-adapter'
import { AddGatewayV1 } from '@helium/transactions'
import Address from '@helium/address'
import { Cluster, PublicKey } from '@solana/web3.js'
import { heliumAddressFromSolKey } from '@helium/spl-utils'
import {
  ManufacturedDeviceType,
  ManufacturedDeviceTypes,
  OutdoorManufacturedDeviceType,
  OutdoorManufacturedDeviceTypes,
} from './types'
import { MAINNET } from '@helium/address/build/NetTypes'
import { ED25519_KEY_TYPE } from '@helium/address/build/KeyTypes'
import { Keypair } from '@helium/crypto'

type GPSLocation = {
  latitude: number
  longitude: number
  accuracy: number
  provider_type: string
  timestamp: number
  altitude: number
  altitude_type: 'MSL' | 'AGL' | 'NONE' | 'UNRECOGNIZED'
}
type GPSLocationResponse = { success: boolean; error?: string; data?: GPSLocation; code: number }

export default class HmhHttpClient {
  private axios!: AxiosInstance
  private owner!: PublicKey
  private mockAdapter?: MockAdapter
  private apiVersion?: 'v2' | 'v1'
  private errorCallback?: (e: unknown) => void
  private logCallback?: (message: string, data?: { [key: string]: any }) => void

  constructor({
    baseURL,
    owner,
    mockRequests,
    apiVersion,
    errorCallback,
    logCallback,
  }: {
    owner: PublicKey
    baseURL: string
    mockRequests?: boolean
    apiVersion?: 'v2' | 'v1'
    errorCallback?: (e: unknown) => void
    logCallback?: (message: string, data?: { [key: string]: any }) => void
  }) {
    this.axios = axios.create({
      baseURL,
    })

    this.apiVersion = apiVersion
    this.owner = owner
    this.errorCallback = errorCallback
    this.logCallback = logCallback

    axiosRetry(this.axios, {
      retries: 4, // number of retries
      retryDelay: (retryCount: number) => {
        return retryCount * 2000 // time interval between retries
      },
    })

    if (mockRequests) {
      this.mockAdapter = new MockAdapter(this.axios, { delayResponse: 1000 })

      if (apiVersion === 'v1') {
        this.mockAdapter.onPost('/on_hotspot_nft_created').reply(200, {})
        this.mockAdapter.onGet('/fw/version').reply(200, { fw_ver: 'v0.11.4' })
      } else {
        this.mockAdapter.onGet('/v2/fw/version').reply(200, { fw_ver: 'v1.5.0' })
        this.mockAdapter
          .onGet('/v2/location/gps')
          .replyOnce(406) // the real api will return 406 if no location data available yet
          .onGet('/v2/location/gps')
          .reply(200, {
            latitude: 44.501528048963436,
            longitude: -88.06224585415643,
            accuracy: 43.210987,
            provider_type: 'GPS',
            altitude_type: 'MSL',
            timestamp: 1701189953,
            altitude: 567.8,
          })
      }
    }
  }

  validateApiVersion = async () => {
    if (this.apiVersion) {
      this.logCallback?.(`Api Version ${this.apiVersion}`)
      return
    }

    const { apiVersion } = await this.getVersionDetails()
    this.logCallback?.(`Api Version ${this.apiVersion}`)
    this.apiVersion = apiVersion
  }

  signGatewayAddTransaction = async (cluster: Cluster, deviceType: ManufacturedDeviceType) => {
    if (!ManufacturedDeviceTypes.includes(deviceType)) {
      throw new Error(`Invalid device type ${deviceType}`)
    }

    const ownerHeliumAddress = heliumAddressFromSolKey(this.owner)

    let body = {} as Record<string, string>

    const url = this.apiVersion === 'v1' ? '/sign_gw_add_tx' : '/v2/signGatewayAddTransaction'
    if (this.apiVersion === 'v1') {
      body = {
        ownerAddress: ownerHeliumAddress,
      } as Record<string, string>
    } else {
      body = {
        ownerAddress: this.owner.toBase58(),
        cluster: cluster,
        deviceType,
      } as Record<string, string>
    }

    this.logCallback?.('signGatewayAddTransaction', { body, url })

    if (this.mockAdapter) {
      const keypair = await Keypair.makeRandom()
      const gateway = new Address(0, MAINNET, ED25519_KEY_TYPE, keypair.publicKey)
      const addGateway = new AddGatewayV1({
        owner: Address.fromB58(ownerHeliumAddress),
        gateway,
      })

      this.mockAdapter.onPost(url).reply(200, {
        gatewayAddress: gateway.b58,
        signedAddGwTx: addGateway.toString(),
      })
    }

    await this.validateApiVersion()

    const response = await this.axios.post<
      { ownerAddress: string; payerAddress: string },
      AxiosResponse<{ signedAddGwTx: string; gatewayAddress: string }>
    >(url, body)

    return { txn: response.data.signedAddGwTx, apiVersion: this.apiVersion }
  }

  getApiVersion = () => {
    return this.apiVersion
  }

  getVersionDetails = async (): Promise<{
    status: number
    firmwareVersion?: string
    apiVersion?: 'v2' | 'v1'
  }> => {
    try {
      const v2Response = await this.axios.get<{ fw_ver: string }>('/v2/fw/version')
      if (v2Response.status === 200) {
        const firmwareVersion = v2Response.data.fw_ver
        this.apiVersion = 'v2'

        return {
          status: v2Response.status,
          firmwareVersion,
          apiVersion: 'v2',
        }
      }
    } catch (e) {
      this.errorCallback?.(e)
    }

    try {
      const v1Response = await this.axios.get<{ fw_ver: string }>('/fw/version')
      const firmwareVersion = v1Response.data.fw_ver
      this.apiVersion = 'v1'

      return {
        status: v1Response.status,
        firmwareVersion,
        apiVersion: 'v1',
      }
    } catch (e) {
      this.errorCallback?.(e)

      const err = e as AxiosError
      return { status: err.status || 404 }
    }
  }

  getGpsLocation = async (
    deviceType: OutdoorManufacturedDeviceType,
  ): Promise<GPSLocationResponse> => {
    try {
      this.logCallback?.('getGpsLocation')
      if (!OutdoorManufacturedDeviceTypes.includes(deviceType)) {
        throw new Error(`Invalid device type ${deviceType}. Only outdoor devices have GPS.`)
      }

      if (this.apiVersion === 'v1') {
        throw new Error('GPS location is not supported on api version v1')
      }

      const apiResponse = await this.axios.get<GPSLocation>('/v2/location/gps')
      this.logCallback?.('getGpsLocation response', apiResponse.data)

      return { success: true, data: apiResponse.data, code: apiResponse.status }
    } catch (e) {
      const err = e as AxiosError

      let error = typeof err.response?.data === 'string' ? err.response.data : ''

      if (err.response?.status) {
        switch (err.response.status) {
          case 406:
            this.logCallback?.('getGpsLocation - no location data available yet')
            return {
              success: false,
              code: err.response.status,
              error: error || 'No location data available yet.',
            }
          case 501: // this shouldn't happen as we prevent it, but just in case
            this.errorCallback?.(`getGpsLocation failed: Status: ${err.response.status}`)
            return {
              success: false,
              code: err.response.status,
              error: error || 'GPS is not available on this device.',
            }
          default:
            this.errorCallback?.(`getGpsLocation failed: Status: ${err.response.status}`)
            return {
              success: false,
              code: err.response.status,
              error: error || 'Unknown error getting GPS location.',
            }
        }
      }
      throw e
    }
  }

  onHotspotCreated = async (opts: { assetId: string; cluster: Cluster }) => {
    try {
      await this.validateApiVersion()

      if (this.apiVersion === 'v2') {
        // this call is no longer supported or necessary on api version v2
        this.logCallback?.(
          'onHotspotCreated - returning true as this call is no longer supported or necessary on api version v2',
        )
        return true
      }

      const response = await this.axios.post<{ assetId: string }, AxiosResponse>(
        '/on_hotspot_nft_created',
        opts,
      )

      const isSuccessful = response.status >= 200 && response.status < 300
      this.logCallback?.(`onHotspotCreated - returning ${isSuccessful}`)
      return isSuccessful
    } catch (e) {
      this.errorCallback?.(e)

      const err = e as AxiosError
      if (err.request?.response) {
        throw new Error(`${err.request.response}\nStatus Code: ${err.response?.status}`)
      }
      throw e
    }
  }
}
