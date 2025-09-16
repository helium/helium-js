import { init as initDc } from '@helium/data-credits-sdk'
import { init as initHem } from '@helium/helium-entity-manager-sdk'
import { getUpdateMetaData } from './HotspotOnboardingUtil'
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
  deviceType: DeviceType | null
}

export type Maker = {
  id: number
  name: string
  address: string
  locationNonceLimit: number
  createdAt: string
  updatedAt: string
}

export type MobileDeploymentInfoV0 = {
  cbrsInfoV0?: { radioInfos: RadioInfoV0[] }
  wifiInfoV0?: WifiInfoV0
}

export type WifiInfoV0 = {
  antenna: number
  elevation: number
  azimuth: number
  mechanicalDownTilt: number
  electricalDownTilt: number
  serial: string | null
}

export type RadioInfoV0 = {
  radioId: string
  elevation: number
}

export type MobileMetadata = {
  location: string
  deploymentInfo: MobileDeploymentInfoV0
  hotspotAddress: string
}

export type IotMetadata = {
  location: string
  hotspotAddress: string
  elevation: number
  gain: number
  payer: string
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
export type NetworkType = 'IOT' | 'MOBILE'
export type DeviceType = 'Cbrs' | 'WifiIndoor' | 'WifiOutdoor' | null // null is for IOT devices

export const HNT_AS_BONES = new BN(100000000)
export const TXN_FEE_IN_LAMPORTS = new BN(5000)

export type HemProgram = Awaited<ReturnType<typeof initHem>>
export type DcProgram = Awaited<ReturnType<typeof initDc>>
export type AssertData = Awaited<ReturnType<typeof getUpdateMetaData>>

export type SubmitStatus = {
  totalProgress: number
  currentBatchProgress: number
  currentBatchSize: number
}

export const ProgressKeys = [
  'get_add_gateway',
  'got_add_gateway',
  'fetch_create',
  'submit_create',
  'verify_create',
  'fetch_mobile',
  'got_mobile',
  'submit_signed_messages',
  'verify_mobile',
  'complete',
] as const
export type ProgressStep = (typeof ProgressKeys)[number]
