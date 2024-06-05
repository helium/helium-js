/**
 * [[include:onboarding/README.md]]
 * @packageDocumentation
 * @module onboarding
 */

import OnboardingClient from './OnboardingClient'

export { default as MobileHotspotOnboarding } from './MobileHotspotOnboarding'
export { default as SolanaOnboarding } from './SolanaOnboarding'
export { default as degToCompass } from './degToCompass'

export default OnboardingClient

export {
  Maker,
  OnboardingRecord,
  NetworkType,
  DeviceType,
  ManufacturedDeviceType,
  HeightType,
  ProgressStep,
} from './types'

export { Message } from './OutdoorConfig'
