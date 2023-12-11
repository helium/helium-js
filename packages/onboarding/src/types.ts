import { init as initDc } from '@helium/data-credits-sdk'
import { init as initHem } from '@helium/helium-entity-manager-sdk'
import { getAssertData } from './AssertUtil'
import BN from 'bn.js'

export const DEWI_ONBOARDING_API_BASE_URL = 'https://onboarding.dewi.org/api'
export const DEWI_ONBOARDING_API_BASE_URL_V2 = `${DEWI_ONBOARDING_API_BASE_URL}/v2`
export const DEWI_ONBOARDING_API_BASE_URL_V3 = `${DEWI_ONBOARDING_API_BASE_URL}/v3`

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

export type Metadata = {
  location: string
  elevation: number
  gain: number
}

export const IndoorManufacturedDeviceTypes = ['HeliumMobileIndoor'] as const
export type IndoorManufacturedDeviceType = (typeof IndoorManufacturedDeviceTypes)[number]

export const OutdoorManufacturedDeviceTypes = ['HeliumMobileOutdoor'] as const
export type OutdoorManufacturedDeviceType = (typeof OutdoorManufacturedDeviceTypes)[number]

export const ManufacturedDeviceTypes = [
  ...IndoorManufacturedDeviceTypes,
  ...OutdoorManufacturedDeviceTypes,
] as const
export type ManufacturedDeviceType = (typeof ManufacturedDeviceTypes)[number]

export type HeightType = 'MSL' | 'AGL' | 'NONE' | 'UNRECOGNIZED'
export type HotspotType = 'IOT' | 'MOBILE'
export type DeviceType = 'Cbrs' | 'WifiIndoor' | 'WifiOutdoor'

export const BONES_IN_HNT = new BN(100000000)
export const TXN_FEE_IN_LAMPORTS = new BN(5000)
export const FULL_LOCATION_STAKING_FEE = new BN(1000000) // $10 - does this need to be updated to $5? It's used as a fallback when something fails

export type HemProgram = Awaited<ReturnType<typeof initHem>>
export type DcProgram = Awaited<ReturnType<typeof initDc>>
export type AssertData = Awaited<ReturnType<typeof getAssertData>>
