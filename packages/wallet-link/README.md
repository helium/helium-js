# `@helium/wallet-link`

> Utilities for linking a 3rd party app to the helium wallet. The link token is used for hotspot onboarding, location assertion, and ownership transfer transaction signing with the Helium Wallet and Hotspot apps.

## Installation

```shell
$ yarn add @helium/wallet-link
# or
$ npm install @helium/wallet-link
```

## Usage

```ts
// Create link to Helium app
const url = createWalletLinkUrl({
  universalLink: 'https://wallet.helium.com/',
  requestAppId: 'com.maker.app',
  callbackUrl: 'makerappscheme://',
  appName: 'Maker App',
})

Linking.openURL(url)

// parse received token
const parsed = parseWalletLinkToken(token)

// verify token
const verified = verifyWalletLinkToken(parsed)

// verify token with max age
const verified = verifyWalletLinkToken(parsed, { maxAgeInSeconds: 60 })

// Create link to update a hotspot
const updateParams = {
  token,
  platform: Platform.OS,
  addGatewayTxn: 'your_optional_unsigned_txn',
  assertLocationTxn: 'your_optional_unsigned_txn',
  transferHotspotTxn: 'your_optional_unsigned_txn',
} as SignHotspotRequest

const url = createUpdateHotspotUrl(updateParams)
Linking.openURL(url)

// submit signed txn
```
