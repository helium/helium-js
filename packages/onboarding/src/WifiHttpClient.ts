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
  private mockAdapater?: MockAdapter

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
      this.mockAdapater = new MockAdapter(this.axios, { delayResponse: 1000 })
      this.mockAdapater.onPost('/on_hotspot_nft_created').reply(200, {})
    }
  }

  getTxnFromGateway = async (payer: PublicKey) => {
    const ownerHeliumAddress = heliumAddressFromSolKey(this.owner)
    const payerHeliumAddress = heliumAddressFromSolKey(payer)
    const body = {
      ownerAddress: ownerHeliumAddress,
      payerAddress: payerHeliumAddress,
    }
    if (this.mockAdapater) {
      const addGateway = new AddGatewayV1({
        owner: Address.fromB58(ownerHeliumAddress),
        payer: Address.fromB58(payerHeliumAddress),
        gateway: MOCK_GATEWAY,
      })

      this.mockAdapater.onPost('/sign_gw_add_tx').reply(200, {
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
