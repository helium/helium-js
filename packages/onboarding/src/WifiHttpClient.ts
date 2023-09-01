import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry'
import MockAdapter from 'axios-mock-adapter'
import { AddGatewayV1 } from '@helium/transactions'
import Address from '@helium/address'

export default class HmhHttpClient {
  private axios!: AxiosInstance
  private ownerHeliumAddress!: Address
  private payerHeliumAddress!: Address

  constructor({
    baseURL,
    ownerHeliumAddress,
    payerHeliumAddress,
    mockRequests,
  }: {
    payerHeliumAddress: string
    ownerHeliumAddress: string
    baseURL: string
    mockRequests?: boolean
  }) {
    this.axios = axios.create({
      baseURL,
    })
    this.ownerHeliumAddress = Address.fromB58(ownerHeliumAddress)
    this.payerHeliumAddress = Address.fromB58(payerHeliumAddress)

    axiosRetry(this.axios, {
      retries: 4, // number of retries
      retryDelay: (retryCount: number) => {
        return retryCount * 2000 // time interval between retries
      },
    })

    if (mockRequests) {
      const mock = new MockAdapter(this.axios, { delayResponse: 1000 })

      const GATEWAY = Address.fromB58('13yTQcEaPEVuYeWRMz9F6XjAMgMJjDuCgueukjaiJzmdvCHncMz')

      const addGateway = new AddGatewayV1({
        owner: this.ownerHeliumAddress,
        payer: this.payerHeliumAddress,
        gateway: GATEWAY,
      })

      mock.onPost('/sign_gw_add_tx').reply(200, {
        gatewayAddress: GATEWAY.b58,
        signedAddGwTx: addGateway.toString(),
      })

      mock.onPost('/on_hotspot_nft_created').reply(200, {})
    }
  }

  getTxnFromGateway = async () => {
    const body = {
      ownerAddress: this.ownerHeliumAddress.b58,
      payerAddress: this.payerHeliumAddress.b58,
    }
    const url = '/sign_gw_add_tx'
    const response = await this.axios.post<
      { ownerAddress: string; payerAddress: string },
      AxiosResponse<{ signedAddGwTx: string; gatewayAddress: string }>
    >(url, body)

    return response.data.signedAddGwTx
  }

  onHotspotCreated = async (assetId: string) => {
    try {
      const response = await this.axios.post<{ assetId: string }, AxiosResponse>(
        '/on_hotspot_nft_created',
        {
          assetId,
        },
      )

      return response.data
    } catch (e) {
      const err = e as AxiosError
      if (err.request.response) {
        throw new Error(`${err.request.response}\nStatus Code: ${err.response?.status}`)
      }
      throw e
    }
  }
}
