export type LinkWalletResponse = {
  status: 'success' | 'user_cancelled'
  token?: string
}

export type SignHotspotResponse = {
  status: 'success' | 'token_not_found' | 'user_cancelled' | 'gateway_not_found' | 'invalid_link'
  assertTxn?: string
  gatewayTxn?: string
  transferTxn?: string
  gatewayAddress?: string
}

export type LinkWalletRequest = {
  requestAppId: string
  callbackUrl: string
  appName: string
}

export type SignHotspotRequest = {
  token: string
  addGatewayTxn?: string
  assertLocationTxn?: string
  transferHotspotTxn?: string
  platform: string
}

export type Token = LinkWalletRequest & {
  signingAppId: string
  time: number
  address: string
}

export type TokenWithSig = Token & {
  signature: string
}

export type MakerApp = {
  universalLink: string
  name: string
  androidPackage: string
  iosBundleId: string
}

export type DelegateApp = {
  universalLink: string
  name: string
  androidPackage: string
  iosBundleId: string
  appStoreId: number
}

const HELIUM_WALLET_APP: DelegateApp = {
  universalLink: 'https://wallet.helium.com/',
  name: 'helium-hnt-wallet',
  androidPackage: 'com.helium.wallet.app',
  iosBundleId: 'com.helium.wallet.app',
  appStoreId: 1609525848,
}

const HELIUM_HOTSPOT_APP: DelegateApp = {
  universalLink: 'https://helium.com/',
  name: 'helium-hotspot',
  androidPackage: 'com.helium.wallet',
  iosBundleId: 'com.helium.mobile.wallet',
  appStoreId: 1450463605,
}

export const DELEGATE_APPS = [HELIUM_WALLET_APP, HELIUM_HOTSPOT_APP]
