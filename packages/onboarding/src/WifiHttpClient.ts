import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry'
import MockAdapter from 'axios-mock-adapter'
import { AddGatewayV1 } from '@helium/transactions'
import Address from '@helium/address'
import { Cluster, PublicKey } from '@solana/web3.js'
import { heliumAddressFromSolKey } from '@helium/spl-utils'
import { ManufacturedDeviceType, ManufacturedDeviceTypes } from './types'

const MOCK_GATEWAY = Address.fromB58('13yTQcEaPEVuYeWRMz9F6XjAMgMJjDuCgueukjaiJzmdvCHncMz')

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
        this.mockAdapter.onGet('/fw/version').reply(200, { fw_ver: 'v0.10.2' })
      } else {
        this.mockAdapter.onGet('/v2/fw/version').reply(200, { fw_ver: 'v2.0.0' })
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
      const addGateway = new AddGatewayV1({
        owner: Address.fromB58(ownerHeliumAddress),
        gateway: MOCK_GATEWAY,
      })

      this.mockAdapter.onPost(url).reply(200, {
        gatewayAddress: MOCK_GATEWAY.b58,
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
      if (err.request.response) {
        throw new Error(`${err.request.response}\nStatus Code: ${err.response?.status}`)
      }
      throw e
    }
  }
}
