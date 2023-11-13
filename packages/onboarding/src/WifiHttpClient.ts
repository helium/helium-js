import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry'
import MockAdapter from 'axios-mock-adapter'
import { AddGatewayV1 } from '@helium/transactions'
import Address from '@helium/address'
import { Cluster, PublicKey } from '@solana/web3.js'
import { heliumAddressFromSolKey } from '@helium/spl-utils'

const MOCK_GATEWAY = Address.fromB58('13yTQcEaPEVuYeWRMz9F6XjAMgMJjDuCgueukjaiJzmdvCHncMz')

export default class HmhHttpClient {
  private axios!: AxiosInstance
  private owner!: PublicKey
  private mockAdapter?: MockAdapter
  private apiVersion?: 'v2' | 'v1'

  constructor({
    baseURL,
    owner,
    mockRequests,
    apiVersion,
  }: {
    owner: PublicKey
    baseURL: string
    mockRequests?: boolean
    apiVersion?: 'v2' | 'v1'
  }) {
    this.axios = axios.create({
      baseURL,
    })

    this.apiVersion = apiVersion
    this.owner = owner

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
    if (this.apiVersion) return

    const { apiVersion } = await this.getVersionDetails()
    this.apiVersion = apiVersion
  }

  signGatewayAddTransaction = async () => {
    const ownerHeliumAddress = heliumAddressFromSolKey(this.owner)
    const body = {
      ownerAddress: ownerHeliumAddress,
    }
    const url = this.apiVersion === 'v1' ? '/sign_gw_add_tx' : '/v2/signGatewayAddTransaction'

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

    return response.data.signedAddGwTx
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
    } catch {}

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
      const err = e as AxiosError

      return { status: err.status || 404 }
    }
  }

  onHotspotCreated = async (opts: { assetId: string; cluster: Cluster }) => {
    try {
      await this.validateApiVersion()

      if (this.apiVersion === 'v2') {
        // this call is no longer supported or necessary on api version v2
        return true
      }

      const response = await this.axios.post<{ assetId: string }, AxiosResponse>(
        '/on_hotspot_nft_created',
        opts,
      )

      return response.status >= 200 && response.status < 300
    } catch (e) {
      const err = e as AxiosError
      if (err.request.response) {
        throw new Error(`${err.request.response}\nStatus Code: ${err.response?.status}`)
      }
      throw e
    }
  }
}
