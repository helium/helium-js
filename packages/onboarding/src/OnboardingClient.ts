import axios, { AxiosInstance, AxiosResponse, Method } from 'axios'
import qs from 'qs'
import { OnboardingRecord, Maker, DEWI_ONBOARDING_API_BASE_URL } from './types'

type Response<T>={
  code: number
  data: T | null
  success: boolean
  errorMessage?: string
  errors?: Array<any>
}

export default class OnboardingClient {
  private axios!: AxiosInstance

  constructor(baseURL: string = DEWI_ONBOARDING_API_BASE_URL) {
    this.axios = axios.create({
      baseURL,
    })
  }

  async execute<T>(method:Method, path: string, params?: Object) {
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

  async get<T>(path: string, params: Object = {}) {
    const query = qs.stringify(params)
    let url = path
    if (query.length > 0) {
      url = [path, query].join('?')
    }

    return this.execute<T>('GET', url)
  }

  async post<T>(path: string, params: Object = {}) {
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

  async postPaymentTransaction(
    gatewayAddress: string,
    transaction: string,
  ) {
    return this.post<{ transaction: string }>(`transactions/pay/${gatewayAddress}`, { transaction })
  }
}
