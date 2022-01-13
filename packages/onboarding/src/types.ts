export const DEWI_ONBOARDING_API_BASE_URL = 'https://onboarding.dewi.org/api/v2'

export type OnboardingRecord = {
  id: number
  onboardingKey: string
  macWlan0: string
  rpiSerial: string
  batch: string
  publicAddress: string
  heliumSerial: string
  macEth0: string
  createdAt: string
  updatedAt: string
  makerId: number
  maker: Maker
  code: number
  errorMessage: string
}

export type Maker = {
  id: number
  name: string
  address: string
  locationNonceLimit: number
  createdAt: string
  updatedAt: string
}
