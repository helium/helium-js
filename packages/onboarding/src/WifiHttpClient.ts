import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry'
import MockAdapter from 'axios-mock-adapter'
import { AddGatewayV1 } from '@helium/transactions'
import Address from '@helium/address'
import { PublicKey } from '@solana/web3.js'
import { heliumAddressFromSolKey } from '@helium/spl-utils'

const MOCK_GATEWAY = Address.fromB58('13yTQcEaPEVuYeWRMz9F6XjAMgMJjDuCgueukjaiJzmdvCHncMz')

export default class HmhHttpClient {
  private axios!: AxiosInstance
  private owner!: PublicKey
  private mockAdapter?: MockAdapter

  constructor({
    baseURL,
    owner,
    mockRequests,
  }: {
    owner: PublicKey
    baseURL: string
    mockRequests?: boolean
  }) {
    this.axios = axios.create({
      baseURL,
    })

    this.owner = owner

    axiosRetry(this.axios, {
      retries: 4, // number of retries
      retryDelay: (retryCount: number) => {
        return retryCount * 2000 // time interval between retries
      },
    })

    if (mockRequests) {
      this.mockAdapter = new MockAdapter(this.axios, { delayResponse: 1000 })
      this.mockAdapter.onPost('/on_hotspot_nft_created').reply(200, {})
      this.mockAdapter.onGet('/fw/version').reply(200, { fw_ver: 'v0.10.2' })
    }
  }

  getTxnFromGateway = async () => {
    const ownerHeliumAddress = heliumAddressFromSolKey(this.owner)
    const body = {
      ownerAddress: ownerHeliumAddress,
    }
    if (this.mockAdapter) {
      const addGateway = new AddGatewayV1({
        owner: Address.fromB58(ownerHeliumAddress),
        gateway: MOCK_GATEWAY,
      })

      this.mockAdapter.onPost('/sign_gw_add_tx').reply(200, {
        gatewayAddress: MOCK_GATEWAY.b58,
        signedAddGwTx: addGateway.toString(),
      })
    }

    const url = '/sign_gw_add_tx'
    const response = await this.axios.post<
      { ownerAddress: string; payerAddress: string },
      AxiosResponse<{ signedAddGwTx: string; gatewayAddress: string }>
    >(url, body)

    return response.data.signedAddGwTx
  }

  checkFwValid = async () => {
    try {
      const url = '/fw/version'
      const response = await this.axios.get<{ fw_ver: string }>(url)
      return {
        status: response.status,
        firmwareVersion: response.data.fw_ver.replace('v', ''),
      }
    } catch (e) {
      const err = e as AxiosError

      return { status: err.status || 404 }
    }
  }

  onHotspotCreated = async (assetId: string) => {
    try {
      const response = await this.axios.post<{ assetId: string }, AxiosResponse>(
        '/on_hotspot_nft_created',
        {
          assetId,
        },
      )

      return response.status === 200
    } catch (e) {
      const err = e as AxiosError
      if (err.request.response) {
        throw new Error(`${err.request.response}\nStatus Code: ${err.response?.status}`)
      }
      throw e
    }
  }
}
