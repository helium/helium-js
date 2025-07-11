<p align="center">
  <img width="120" height="120" src="https://raw.githubusercontent.com/helium/helium-js/master/icon.png">
</p>

# Helium JS SDK

[![Build Status](https://travis-ci.com/helium/helium-js.svg?branch=master)](https://travis-ci.com/helium/helium-js)
[![Coverage Status](https://coveralls.io/repos/github/helium/helium-js/badge.svg?branch=master)](https://coveralls.io/github/helium/helium-js?branch=master)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)

Please view the [Documentation](https://helium.github.io/helium-js/) for usage and examples.

> ⚠️ These libraries are currently in active development and are provided as-is. Helium makes no claims or guarantees about the correctness, reliability or security of this code. PRs welcome, see [CONTRIBUTING](https://github.com/helium/helium-js/blob/master/CONTRIBUTING.md).

This SDK is a collection of TypeScrypt libraries for interacting with the Helium blockchain. For additional documentation about the Helium network, visit the [Developer Site](https://docs.helium.com/).

## Migration to Noble Cryptography

**Important:** This SDK has been updated to use the [@noble/curves](https://github.com/paulmillr/noble-curves) and [@noble/hashes](https://github.com/paulmillr/noble-hashes) libraries instead of `libsodium-wrappers` and `react-native-sodium`. This provides several benefits:

- **Pure JavaScript**: No native dependencies required
- **Audited**: Well-audited cryptography libraries
- **Lightweight**: Tree-shakeable and optimized for performance
- **Cross-platform**: Works consistently across all JavaScript environments
- **Secure**: Industry-standard cryptographic implementations

The API remains the same, but the underlying cryptographic operations now use the Noble libraries.

| Package                                                                                                       | NPM Version                                                      | What it's for                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| [`@helium/crypto`](https://github.com/helium/helium-js/tree/master/packages/crypto)                           | ![npm](https://img.shields.io/npm/v/@helium/crypto)              | Cryptography utilities including keypairs, mnemonics and base58-check encoding                                                   |
| [`@helium/crypto-react-native`](https://github.com/helium/helium-js/tree/master/packages/crypto-react-native) | ![npm](https://img.shields.io/npm/v/@helium/crypto-react-native) | Cryptography utilities following the same interface as `@helium/crypto` but for React Native                                     |
| [`@helium/transactions`](https://github.com/helium/helium-js/tree/master/packages/transactions)               | ![npm](https://img.shields.io/npm/v/@helium/transactions)        | Construct and serialize transaction primitives from their [protobuf](https://developers.google.com/protocol-buffers) definitions |
| [`@helium/proto`](https://github.com/helium/proto)                                                            | ![npm](https://img.shields.io/npm/v/@helium/proto)               | Protobuf definitions for Helium transactions                                                                                     |
| [`@helium/proto-ble`](https://github.com/helium/helium-js/tree/master/packages/proto-ble)                     | ![npm](https://img.shields.io/npm/v/@helium/proto-ble)           | Protobuf definitions for Helium Hotspot ble transactions                                                                         |
| [`@helium/http`](https://github.com/helium/helium-js/tree/master/packages/http)                               | ![npm](https://img.shields.io/npm/v/@helium/http)                | An HTTP client for the blockchain REST API                                                                                       |
| [`@helium/currency`](https://github.com/helium/helium-js/tree/master/packages/currency)                       | ![npm](https://img.shields.io/npm/v/@helium/currency)            | Utilities for representing amounts of the different currencies supported by Helium                                               |
| [`@helium/onboarding`](https://github.com/helium/helium-js/tree/master/packages/onboarding)                   | ![npm](https://img.shields.io/npm/v/@helium/onboarding)          | An HTTP client for interfacing with an Onboarding Server                                                                         |
| [`@helium/address`](https://github.com/helium/helium-js/tree/master/packages/address)                         | ![npm](https://img.shields.io/npm/v/@helium/address)             | Utilities for Helium Addresses                                                                                                   |
| [`@helium/wallet-link`](https://github.com/helium/helium-js/tree/master/packages/wallet-link)                 | ![npm](https://img.shields.io/npm/v/@helium/wallet-link)         | Utilities for linking a 3rd party app to the Helium Wallet                                                                       |

## Installation

Each package can be installed independently depending on what utility you need. For example:

```shell
$ yarn add @helium/crypto @helium/transactions @helium/http
# or
$ npm install @helium/crypto @helium/transactions @helium/http
```

## Usage

The following examples demonstrate some of the more common use cases and show how these packages can be used in combination to accomplish common tasks.

### Creating and submitting a payment transaction

A payment from an owned keypair initialized with a 12 word mnemonic to an address specified by its base58 representation. The transaction is serialized to binary and submitted to the blockchain API.

```js
import { Keypair, Address } from '@helium/crypto'
import { PaymentV1, Transaction } from '@helium/transactions'
import { Client } from '@helium/http'

const client = new Client()

// the transactions library needs to be configured
// with the latest chain vars in order to calcluate fees
const vars = await client.vars.get()
Transaction.config(vars)

// initialize an owned keypair from a 12 word mnemonic
const bob = await Keypair.fromWords(['one', 'two', ..., 'twelve'])

// initialize an address from a b58 string
const alice = Address.fromB58('148d8KTRcKA5JKPekBcKFd4KfvprvFRpjGtivhtmRmnZ8MFYnP3')

// get the speculative nonce for the keypair
const account = await client.accounts.get(bob.address.b58)

// construct a payment txn
const paymentTxn = new PaymentV1({
  payer: bob.address,
  payee: alice,
  amount: 10,
  nonce: account.speculativeNonce + 1,
})

// an appropriate transaction fee is calculated at initialization
console.log('transaction fee is:', paymentTxn.fee)

// sign the payment txn with bob's keypair
const signedPaymentTxn = await paymentTxn.sign({ payer: bob })

// submit the serialized txn to the Blockchain HTTP API
client.transactions.submit(signedPaymentTxn.toString())
```

### Creating an advanced payment transaction

PaymentV2 transactions allow for specifying multiple recipients in the same transaction.

```js
import { Keypair, Address } from '@helium/crypto'
import { PaymentV2, Transaction } from '@helium/transactions'
import { Client } from '@helium/http'

const client = new Client()

// the transactions library needs to be configured
// with the latest chain vars in order to calcluate fees
const vars = await client.vars.get()
Transaction.config(vars)

// initialize an owned keypair from a 12 word mnemonic
const bob = await Keypair.fromWords(['one', 'two', ..., 'twelve'])

// get the speculative nonce for the keypair
const account = await client.accounts.get(bob.address.b58)

// initialize recipient addresses from b58 strings
const alice = Address.fromB58('148d8KTRcKA5JKPekBcKFd4KfvprvFRpjGtivhtmRmnZ8MFYnP3')
const charlie = Address.fromB58('13JoEpkGQUd8bzn2BquFZe1CbmfzhL4cYpEohWH71yxy7cEY59Z')

// construct a PaymentV2 txn
const paymentTxn = new PaymentV2({
  payer: bob.address,
  payments: [
    {
      payee: alice,
      amount: 20,
    },
    {
      payee: charlie,
      amount: 10,
    },
  ],
  nonce: account.speculativeNonce + 1,
})

// an appropriate transaction fee is calculated at initialization
console.log('transaction fee is:', paymentTxn.fee)

// sign the payment txn with bob's keypair
const signedPaymentTxn = await paymentTxn.sign({ payer: bob })

// submit the serialized txn to the Blockchain HTTP API
client.transactions.submit(signedPaymentTxn.toString())
```
