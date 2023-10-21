import axios, { AxiosInstance, AxiosResponse, Method } from 'axios'
import { v4 as uuidv4 } from 'uuid'
import axiosRetry from 'axios-retry'
import qs from 'qs'
import { OnboardingRecord, Maker, Metadata, HotspotType } from './types'
import MockAdapter from 'axios-mock-adapter'
import updateTxn from './updateTxn'
import BN from 'bn.js'

type Response<T> = {
  code: number
  data: T | null
  success: boolean
  errorMessage?: string
  errors?: Array<any>
}

export default class OnboardingClient {
  private axios!: AxiosInstance

  constructor(
    baseURL: string,
    opts?: { retryOn404?: boolean; retryCount?: number; mockRequests?: boolean },
  ) {
    this.axios = axios.create({
      baseURL: baseURL.endsWith('/') ? baseURL : `${baseURL}/`,
    })

    const retryOn404 = opts?.retryOn404 ?? true
    const retries = opts?.retryCount ?? 5
    const mockRequests = opts?.mockRequests ?? false

    if (retryOn404) {
      axiosRetry(this.axios, {
        retries,
        retryDelay: axiosRetry.exponentialDelay,
        retryCondition: (error) => error.response?.status === 404,
      })
    }

    if (mockRequests) {
      const mock = new MockAdapter(this.axios, { delayResponse: 300 })

      mock.onPost('/transactions/create-hotspot').reply(200, {
        data: {
          solanaTransactions: [updateTxn],
        },
      })

      mock.onPost('transactions/mobile/onboard').reply(200, {
        data: {
          solanaTransactions: [updateTxn],
        },
      })

      mock.onPost('transactions/mobile/update-metadata').reply(200, {
        data: {
          solanaTransactions: [updateTxn],
        },
      })

      mock.onPost('transactions/iot/onboard').reply(200, {
        data: {
          solanaTransactions: [updateTxn],
        },
      })

      mock.onPost('transactions/iot/update-metadata').reply(200, {
        data: {
          solanaTransactions: ['asdf1234'],
        },
      })

      mock.onPost('hotspots').reply(200, {})
    }
  }

  private async execute<T>(method: Method, path: string, params?: Object) {
    try {
      const response: AxiosResponse<Response<T>> = await this.axios({
        method,
        url: path,
        data: params,
      })
      if (response.data.errorMessage) {
        throw new Error(response.data.errorMessage)
      }
      if (response.data.success === false) {
        throw new Error(`Failed with code ${response.data.code}}`)
      }
      return response.data
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return err.response?.data as Response<T>
      }
      throw err
    }
  }

  private async get<T>(path: string, params: Object = {}) {
    const query = qs.stringify(params)
    let url = path
    if (query.length > 0) {
      url = [path, query].join('?')
    }

    return this.execute<T>('GET', url)
  }

  private async post<T>(path: string, params: Object = {}) {
    return this.execute<T>('POST', path, params)
  }

  async getOnboardingRecord(gatewayAddress: string) {
    return this.get<OnboardingRecord>(`hotspots/${gatewayAddress}`)
  }

  async getMakers() {
    return this.get<Maker[]>('makers')
  }

  async getFirmware() {
    return this.get<{ version: string }>('firmware')
  }

  async postPaymentTransaction(gatewayAddress: string, transaction: string) {
    return this.post<{ transaction: string; solanaTransactions?: string[] }>(
      `transactions/pay/${gatewayAddress}`,
      { transaction },
    )
  }

  async createHotspot(opts: { transaction: string; payer?: string }) {
    return this.post<{ solanaTransactions: number[][] }>('transactions/create-hotspot', opts)
  }

  async onboard(
    opts: {
      hotspotAddress: string
      type: HotspotType
      payer?: string
    } & Partial<Metadata>,
  ) {
    let location: string | undefined = undefined
    if (opts.location) {
      location = new BN(opts.location, 'hex').toString()
    }

    return this.post<{ solanaTransactions: number[][] }>(
      `transactions/${opts.type.toLowerCase()}/onboard`,
      {
        entityKey: opts.hotspotAddress,
        location,
        elevation: opts.elevation,
        gain: opts.gain,
        payer: opts.payer,
      },
    )
  }

  async onboardIot(opts: { hotspotAddress: string; payer?: string } & Partial<Metadata>) {
    return this.onboard({ ...opts, type: 'IOT' })
  }

  async onboardMobile(opts: { hotspotAddress: string; payer?: string } & Partial<Metadata>) {
    return this.onboard({ ...opts, type: 'MOBILE' })
  }

  async updateMetadata(
    opts: Partial<Metadata> & {
      type: HotspotType
      hotspotAddress: string
      solanaAddress: string
      payer?: string
    },
  ) {
    const { solanaAddress, elevation, gain, hotspotAddress, type, payer } = opts

    let location: string | undefined = undefined
    if (opts.location) {
      location = new BN(opts.location, 'hex').toString()
    }

    const body = {
      entityKey: hotspotAddress,
      location,
      elevation,
      gain,
      wallet: solanaAddress,
      payer,
    }
    return this.post<{ solanaTransactions: number[][] }>(
      `transactions/${type.toLowerCase()}/update-metadata`,
      body,
    )
  }

  async updateIotMetadata(
    opts: Partial<Metadata> & {
      hotspotAddress: string
      solanaAddress: string
      payer?: string
    },
  ) {
    return this.updateMetadata({ ...opts, type: 'IOT' })
  }

  async updateMobileMetadata(
    opts: Partial<Metadata> & {
      hotspotAddress: string
      solanaAddress: string
      payer?: string
    },
  ) {
    return this.updateMetadata({ ...opts, type: 'MOBILE' })
  }

  async addToOnboardingServer({
    onboardingKey,
    authToken,
  }: {
    onboardingKey: string
    authToken: string
  }) {
    return this.axios.post(
      'hotspots',
      {
        onboardingKey,
        macWlan0: uuidv4(),
        macEth0: uuidv4(),
        rpiSerial: uuidv4(),
        heliumSerial: uuidv4(),
        batch: 'example-batch',
      },
      {
        headers: {
          authorization: authToken,
        },
      },
    )
  }
}
