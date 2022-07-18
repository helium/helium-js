# `@helium/wallet-link`

Utilities for linking a 3rd party app to the helium wallet. The link token is used for hotspot onboarding, location
assertion, and ownership transfer transaction signing with the Helium Wallet and Hotspot apps.

## Installation

### React Native

```shell
$ yarn add @helium/wallet-link @helium/crypto-react-native
$ yarn add --dev patch-package postinstall-postinstall
# or
$ npm install @helium/wallet-link @helium/crypto-react-native
$ npm install --save-dev patch-package
```

When using this library in React Native you must patch the `@helium/crypto` calls
with `@helium/crypto-react-native`. You can do this using [patch-package](https://github.com/ds300/patch-package)
by adding the following file to your React Native root at `/patches/@helium+wallet-link+4.6.1.patch`.

```
diff --git a/node_modules/@helium/wallet-link/build/walletLink.js b/node_modules/@helium/wallet-link/build/walletLink.js
index 5378554..de9d701 100644
--- a/node_modules/@helium/wallet-link/build/walletLink.js
+++ b/node_modules/@helium/wallet-link/build/walletLink.js
@@ -17,7 +17,7 @@ Object.defineProperty(exports, "__esModule", { value: true });
 exports.createUpdateHotspotUrl = exports.createSignHotspotCallbackUrl = exports.createLinkWalletCallbackUrl = exports.createWalletLinkUrl = exports.parseWalletLinkToken = exports.verifyWalletLinkToken = exports.makeAppLinkAuthToken = void 0;
 /* eslint-disable object-curly-newline */
 const address_1 = __importDefault(require("@helium/address"));
-const crypto_1 = require("@helium/crypto");
+const crypto_1 = require("@helium/crypto-react-native");
 const query_string_1 = __importDefault(require("query-string"));
 const date_fns_1 = require("date-fns");
 const types_1 = require("./types");
```

In your `package.json` add the following script to run the patch on postinstall:

```diff
 "scripts": {
+  "postinstall": "patch-package"
 }
```

Lastly run `yarn` or `npm install` and the patch will be installed.

### Browser or other JS environments

```shell
$ yarn add @helium/wallet-link @helium/crypto
# or
$ npm install @helium/wallet-link @helium/crypto
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
