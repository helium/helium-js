# Helium JS SDK

[![Build Status](https://travis-ci.com/helium/helium-js.svg?branch=master)](https://travis-ci.com/helium/helium-js)
[![Coverage Status](https://coveralls.io/repos/github/helium/helium-js/badge.svg?branch=master)](https://coveralls.io/github/helium/helium-js?branch=master)
[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com)

> :warning: These libraries are currently in active development and are provided as-is. Helium makes no claims or guarantees about the correctness, reliability or security of this code. PRs welcome, see [CONTRIBUTING](https://github.com/heilum/helium-js/blob/master/CONTRIBUTING.md).


This SDK is a collection of TypeScrypt libraries for interacting with the Helium blockchain. For additional documentation about the Helium network, visit the [Developer Site](https://developer.helium.com).


| Package | NPM Version | What it's for |
|-------------------------------------------------------------------------------------------------|-----------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| [`@helium/crypto`](https://github.com/helium/helium-js/tree/master/packages/crypto) | ![npm](https://img.shields.io/npm/v/@helium/crypto) | Cryptography utilities including keypairs, mnemonics and base58-check encoding |
| [`@helium/crypto-react-native`](https://github.com/helium/helium-js/tree/master/packages/crypto-react-native) | ![npm](https://img.shields.io/npm/v/@helium/crypto-react-native) | Cryptography utilities following the same interface as `@helium/crypto` but for React Native |
| [`@helium/transactions`](https://github.com/helium/helium-js/tree/master/packages/transactions) | ![npm](https://img.shields.io/npm/v/@helium/transactions) | Construct and serialize transaction primatives from their [protobuf](https://developers.google.com/protocol-buffers) definitions |
| [`@helium/proto`](https://github.com/helium/proto) | ![npm](https://img.shields.io/npm/v/@helium/proto) | Protobuf definitions for Helium transactions |
| [`@helium/http`](https://github.com/helium/helium-js/tree/master/packages/http) | ![npm](https://img.shields.io/npm/v/@helium/http) | An HTTP client for the blockchain REST API |
| [`@helium/currency`](https://github.com/helium/helium-js/tree/master/packages/currency) | ![npm](https://img.shields.io/npm/v/@helium/currency) | Utilities for representing amounts of the different currencies supported by Helium |


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

### Sending an Account's full balance
Sending the maximum amount from an account (leaving a 0 HNT balance) requires taking into account the transaction fee. All fees are denominated in Data Credits (DC), which is equal to $0.00001 USD, meaning 35,000 DC equals $0.35 USD. DC are obtained by _burning_ HNT, permanantly removing it from circulation. If you do not already have DC in your account, the appropriate amount of HNT will be burned to cover the fee.

The general formula is:
`amountToSend = balance - feeInHNT`

The packages in helium-js provide utility functions to calculate the above:

```js
import { Keypair, Address } from '@helium/crypto'
import { PaymentV2, Transaction } from '@helium/transactions'
import { Client } from '@helium/http'
import { Balance, CurrencyType } from '@helium/currency'

const client = new Client()

// the transactions library needs to be configured
// with the latest chain vars in order to calcluate fees
const vars = await client.vars.get()
Transaction.config(vars)

// assuming bob has a balance of 100 HNT
const bob = await Keypair.fromWords(['one', 'two', ..., 'twelve'])

// initialize an address from a b58 string
const alice = Address.fromB58('148d8KTRcKA5JKPekBcKFd4KfvprvFRpjGtivhtmRmnZ8MFYnP3')

// get the speculative nonce for the keypair
const account = await client.accounts.get(bob.address.b58)

// construct a PaymentV2 txn for the purpose
// of calculating the fee
const paymentTxnForFee = new PaymentV2({
  payer: bob.address,
  payments: [
    {
      payee: alice,
      amount: account.balance.integerBalance,
    },
  ],
  nonce: account.speculativeNonce + 1,
})

// calculate max sendable amount
const feeInDC = new Balance(paymentTxnForFee.fee, CurrencyType.dataCredit)
const oracle = await client.oracle.getCurrentPrice()
const feeInHNT = feeInDC.toNetworkTokens(oracle.price)
const amountToSend = account.balance.minus(feeInHNT).integerBalance

// construct a PaymentV2 txn to sign
const paymentTxnForFee = new PaymentV2({
  payer: bob.address,
  payments: [
    {
      payee: alice,
      amount: amountToSend,
    },
  ],
  nonce: account.speculativeNonce + 1,
})

// sign the payment txn with bob's keypair
const signedPaymentTxn = await paymentTxn.sign({ payer: bob })

// submit the serialized txn to the Blockchain HTTP API
client.transactions.submit(signedPaymentTxn.toString())

```

> :warning: Note that oracle prices change over time. It's possible for a transaction to fail if the oracle price changes in between the time the transaction is conrstructed and when it is absorbed by the consensus group. The API exposes what the next oracle price will be at `https://api.helium.io
/v1/oracle/predictions`. See https://developer.helium.com/blockchain/api/oracle for more details. To avoid failed transactions, it may be worth querying both the oracle predictions, and the current oracle value, and taking the greater of those values.
