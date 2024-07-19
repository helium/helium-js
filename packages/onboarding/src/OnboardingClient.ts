import axios, { AxiosInstance, AxiosResponse, Method } from 'axios'
import axiosRetry from 'axios-retry'
import qs from 'qs'
import { OnboardingRecord, Maker, MobileMetadata, DeviceType, IotMetadata } from './types'
import MockAdapter from 'axios-mock-adapter'
import updateTxn from './updateTxn'
import BN from 'bn.js'

export type OnboardingResponse<T> = {
  code: number
  data: T | null
  success: boolean
  errorMessage?: string
  errors?: Array<any>
}

export default class OnboardingClient {
  private axios!: AxiosInstance
  private mockRequests!: boolean

  constructor(
    baseURL: string,
    opts?: { retryOn404?: boolean; retryCount?: number; mockRequests?: boolean },
  ) {
    this.axios = axios.create({
      baseURL: baseURL.endsWith('/') ? baseURL : `${baseURL}/`,
    })

    const retryOn404 = opts?.retryOn404 ?? true
    const retries = opts?.retryCount ?? 5
    this.mockRequests = opts?.mockRequests || false

    if (retryOn404) {
      axiosRetry(this.axios, {
        retries,
        retryDelay: axiosRetry.exponentialDelay,
        retryCondition: (error) => error.response?.status === 404,
      })
    }

    if (this.mockRequests) {
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
      const response: AxiosResponse<OnboardingResponse<T>> = await this.axios({
        method,
        url: path,
        data: params,
      })
      if (response.data?.errorMessage) {
        throw new Error(response.data.errorMessage)
      }
      if (response.data?.success === false) {
        throw new Error(`Failed with code ${response.data.code}}`)
      }
      return response.data
    } catch (err) {
      if (axios.isAxiosError(err)) {
        return err.response?.data as OnboardingResponse<T>
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

  async onboardIot(opts: { hotspotAddress: string; payer?: string } & Partial<IotMetadata>) {
    let location: string | undefined = undefined
    if (opts.location) {
      location = new BN(opts.location, 'hex').toString()
    }

    return this.post<{ solanaTransactions: number[][] }>('transactions/iot/onboard', {
      entityKey: opts.hotspotAddress,
      location,
      payer: opts.payer,
      gain: opts.gain,
      elevation: opts.elevation,
    })
  }

  async onboardMobile(opts: { hotspotAddress: string; payer?: string } & Partial<MobileMetadata>) {
    let location: string | undefined = undefined
    if (opts.location) {
      location = new BN(opts.location, 'hex').toString()
    }

    return this.post<{ solanaTransactions: number[][] }>('transactions/mobile/onboard', {
      entityKey: opts.hotspotAddress,
      location,
      deploymentInfo: opts.deploymentInfo,
      payer: opts.payer,
    })
  }

  async updateIotMetadata(
    opts: Partial<IotMetadata> & {
      hotspotAddress: string
      solanaAddress: string
      payer?: string
    },
  ) {
    const { solanaAddress, hotspotAddress, payer } = opts

    let location: string | undefined = undefined
    if (opts.location) {
      location = new BN(opts.location, 'hex').toString()
    }

    const body = {
      entityKey: hotspotAddress,
      location,
      payer,
      wallet: solanaAddress,
      gain: opts.gain,
      elevation: opts.elevation,
    }
    return this.post<{ solanaTransactions: number[][] }>('transactions/iot/update-metadata', body)
  }

  async updateMobileMetadata(
    opts: Partial<MobileMetadata> & {
      hotspotAddress: string
      solanaAddress: string
      payer?: string
    },
  ) {
    const { solanaAddress, deploymentInfo, hotspotAddress, payer } = opts

    let location: string | undefined = undefined
    if (opts.location) {
      location = new BN(opts.location, 'hex').toString()
    }

    const body = {
      deploymentInfo,
      entityKey: hotspotAddress,
      location,
      payer,
      wallet: solanaAddress,
    }
    return this.post<{ solanaTransactions: number[][] }>(
      'transactions/mobile/update-metadata',
      body,
    )
  }

  async addToOnboardingServer({
    authToken,
    ...postBody
  }: {
    onboardingKey: string
    authToken: string
    deviceType: DeviceType
    batch: string
    heliumSerial: string
    macEth0: string
    macWlan0: string
    rpiSerial: string
  }) {
    return this.axios.post('hotspots', postBody, {
      headers: {
        authorization: authToken,
      },
    })
  }
}
