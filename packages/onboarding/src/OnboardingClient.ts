import axios, { AxiosInstance, AxiosResponse, Method } from 'axios'
import axiosRetry from 'axios-retry'
import qs from 'qs'
import { OnboardingRecord, Maker, Metadata, HotspotType } from './types'

type Response<T> = {
  code: number
  data: T | null
  success: boolean
  errorMessage?: string
  errors?: Array<any>
}

export default class OnboardingClient {
  private axios!: AxiosInstance

  constructor(baseURL: string, opts?: { retryOn404?: boolean; retryCount?: number }) {
    this.axios = axios.create({
      baseURL,
    })

    const retryOn404 = opts?.retryOn404 ?? true
    const retries = opts?.retryCount ?? 5

    if (retryOn404) {
      axiosRetry(this.axios, {
        retries,
        retryDelay: axiosRetry.exponentialDelay,
        retryCondition: (error) => error.response?.status === 404,
      })
    }
  }

  private async execute<T>(method: Method, path: string, params?: Object) {
    try {
      const response: AxiosResponse<Response<T>> = await this.axios({
        method,
        url: path,
        data: params,
      })
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

  async createHotspot(opts: { transaction: string }) {
    return this.post<{ solanaTransactions: number[][] }>('transactions/create-hotspot', opts)
  }

  async onboard(
    opts: {
      hotspotAddress: string
      type: HotspotType
    } & Partial<Metadata>,
  ) {
    return this.post<{ solanaTransactions: number[][] }>(`transactions/${opts.type}/onboard`, {
      entityKey: opts.hotspotAddress,
      location: opts.location,
      elevation: opts.elevation,
      gain: opts.gain,
    })
  }

  async onboardIot(opts: { hotspotAddress: string } & Partial<Metadata>) {
    return this.onboard({ ...opts, type: 'iot' })
  }

  async onboardMobile(opts: { hotspotAddress: string } & Partial<Metadata>) {
    return this.onboard({ ...opts, type: 'mobile' })
  }

  async updateIotMetadata({
    solanaAddress,
    location,
    elevation,
    gain,
    hotspotAddress,
  }: Metadata & {
    hotspotAddress: string
    solanaAddress: string
  }) {
    const body = {
      entityKey: hotspotAddress,
      location,
      elevation,
      gain,
      wallet: solanaAddress,
    }
    return this.post<{ solanaTransactions: number[][] }>('transactions/iot/update-metadata', body)
  }
}
