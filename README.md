# Helium JS SDK

[![Build Status](https://travis-ci.com/helium/helium-js.svg?branch=master)](https://travis-ci.com/helium/helium-js)
[![Coverage Status](https://coveralls.io/repos/github/helium/helium-js/badge.svg?branch=master)](https://coveralls.io/github/helium/helium-js?branch=master)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)

> :warning: These libraries are currently in active development and are provided as-is. Helium makes no claims or guarantees about the correctness, reliability or security of this code. PRs welcome, see [CONTRIBUTING](https://github.com/heilum/helium-js/blob/master/CONTRIBUTING.md).


This SDK is a collection of TypeScrypt libraries for interacting with the Helium blockchain. For additional documentation about the Helium network, visit the [Developer Site](https://developer.helium.com).


| Package | NPM Version | What it's for |
|-------------------------------------------------------------------------------------------------|-----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| [`@helium/crypto`](https://github.com/helium/helium-js/tree/master/packages/crypto) | ![npm](https://img.shields.io/npm/v/@helium/crypto) | Cryptography utilities including keypairs, mnemonics and base58-check encoding |
| [`@helium/transactions`](https://github.com/helium/helium-js/tree/master/packages/transactions) | ![npm](https://img.shields.io/npm/v/@helium/transactions) | Construct and serialize transaction primatives from their [protobuf](https://developers.google.com/protocol-buffers) definitions |
| [`@helium/proto`](https://github.com/helium/proto) | ![npm](https://img.shields.io/npm/v/@helium/proto) | Protobuf definitions for Helium transactions |
| [`@helium/http`](https://github.com/helium/helium-js/tree/master/packages/http) | ![npm](https://img.shields.io/npm/v/@helium/http) | An HTTP client for the blockchain REST API |
| `@helium/cli` |  | A CLI for managing accounts locally and querying the blockchain API |


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
import { PaymentV1 } from '@helium/transactions'
import { Client } from '@helium/http'

// initialize an owned keypair from a 12 word mnemonic
const bob = await Keypair.fromWords(['one', 'two', ..., 'twelve'])

// initialize an address from a b58 string
const alice = Address.fromB58('148d8KTRcKA5JKPekBcKFd4KfvprvFRpjGtivhtmRmnZ8MFYnP3')

// construct a payment txn
const paymentTxn = new PaymentV1({
  payer: bob.address,
  payee: alice,
  amount: 10,
  nonce: 1,
})

// sign the payment txn with bob's keypair
const signedPaymentTxn = await paymentTxn.sign({ payer: bob })

// submit the serialized txn to the Blockchain HTTP API
const client = new Client()
client.transactions.submit(signedPaymentTxn.toString())
```

### Creating an advanced payment transaction
PaymentV2 transactions allow for specifying multiple recipients in the same transaction.

```js
import { Keypair, Address } from '@helium/crypto'
import { PaymentV2 } from '@helium/transactions'
import { Client } from '@helium/http'

// initialize an owned keypair from a 12 word mnemonic
const bob = await Keypair.fromWords(['one', 'two', ..., 'twelve'])

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
  nonce: 1,
})

// sign the payment txn with bob's keypair
const signedPaymentTxn = await paymentTxn.sign({ payer: bob })

// submit the serialized txn to the Blockchain HTTP API
const client = new Client()
client.transactions.submit(signedPaymentTxn.toString())
```
