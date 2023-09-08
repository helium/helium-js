/**
 * [[include:onboarding/README.md]]
 * @packageDocumentation
 * @module onboarding
 */

import OnboardingClient from './OnboardingClient'

export { default as MobileWifiOnboarding } from './MobileWifiOnboarding'
export { default as SolanaOnboarding } from './SolanaOnboarding'

export default OnboardingClient

export { Maker, OnboardingRecord, HotspotType } from './types'
