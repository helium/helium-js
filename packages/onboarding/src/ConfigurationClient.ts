import axios, { AxiosInstance, AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry'
import MockAdapter from 'axios-mock-adapter'
import { Cluster, PublicKey } from '@solana/web3.js'
import { Message, heightTypeFromJSON } from './OutdoorConfig'
import { HeightType } from './types'
import bs58 from 'bs58'
import { utils } from '@helium/crypto'

export default class ConfigurationClient {
  private axios!: AxiosInstance
  private mockAdapter?: MockAdapter
  private cluster!: Cluster
  private wallet!: PublicKey

  constructor({
    cluster,
    mockRequests,
    wallet,
  }: {
    cluster: Cluster
    wallet: PublicKey
    mockRequests?: boolean
  }) {
    this.cluster = cluster
    this.wallet = wallet
    this.axios = axios.create({
      baseURL: 'https://hmh-configuration-api.wifi.freedomfi.com',
    })

    axiosRetry(this.axios, {
      retries: 4, // number of retries
      retryDelay: (retryCount: number) => {
        return retryCount * 2000 // time interval between retries
      },
    })

    if (mockRequests) {
      this.mockAdapter = new MockAdapter(this.axios, { delayResponse: 1000 })
    }
  }

  async createConfigurationMessage(opts: {
    lat: number
    lng: number
    heightInMeters: number
    azimuth: number
    heightType: HeightType
    hotspotAddress: string
    antenna?: number
  }) {
    const message = Message.create()
    message.hmhPubKey = bs58.decode(opts.hotspotAddress)
    message.cluster = this.cluster
    message.walletPubKey = this.wallet.toBytes()
    message.lat = opts.lat
    message.long = opts.lng
    message.height = opts.heightInMeters
    message.azimuth = opts.azimuth
    message.timestamp = Math.floor(Date.now() / 1000)
    message.antenna = opts.antenna || 18 // outdoor antenna
    message.heightType = heightTypeFromJSON(opts.heightType)

    return Message.encode(message).finish()
  }

  async sendConfigurationMessage({
    originalMessage,
    signedMessage,
    hotspotAddress,
    token,
  }: {
    hotspotAddress: string
    originalMessage: Uint8Array
    signedMessage: Uint8Array
    token: string
  }) {
    const message = Message.decode(originalMessage)

    let verified = false
    try {
      verified = await utils.verify(signedMessage, originalMessage, message.walletPubKey)
    } catch {}

    if (!verified) {
      throw new Error('Config Message verification failed')
    }

    const url = `/api/v1/hmhpubkey/${hotspotAddress}/submitCoverageConfigurationMessage`

    message.signature = signedMessage
    const encodedMessage = Message.encode(message).finish()
    const body = { payloadB64: Buffer.from(encodedMessage).toString('base64') }

    if (this.mockAdapter) {
      this.mockAdapter.onPost(url).reply(204, { success: true })
    }

    return this.axios.post<{ ownerAddress: string; payerAddress: string }, AxiosResponse<any>>(
      url,
      body,
      {
        headers: {
          'X-API-KEY': token,
          'Content-Type': 'application/json',
        },
      },
    )
  }
}
