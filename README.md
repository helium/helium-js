# Helium JS SDK

> :warning: These libraries are currently in active development and are provided as-is. Helium makes no claims or guarantees about the correctness, reliability or security of this code. PRs welcome, see [CONTRIBUTING](https://github.com/heilum/helium-js/blob/master/CONTRIBUTING.md).


This SDK is a collection of libraries for interacting with the Helium blockchain.


| NPM Package | What it's for |
|-------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------|
| [`@helium/crypto`](https://github.com/helium/helium-js/tree/master/packages/crypto) | Cryptography utilities including keypairs, mnemonics and base58-check encoding |
| [`@helium/transactions`](https://github.com/helium/helium-js/tree/master/packages/transactions) | Construct and serialize transaction primatives from their [protobuf](https://developers.google.com/protocol-buffers) definitions |
| [`@helium/proto`](https://github.com/helium/proto) | Protobuf definitions for Helium transactions |
| [`@helium/http`](https://github.com/helium/helium-js/tree/master/packages/http) | An HTTP client for the blockchain REST API |
| `@helium/cli` | A CLI for managing accounts locally and querying the blockchain API |


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
  payee: aliceAddress,
  amount: 10,
  nonce: 1,
})

// sign the payment txn with bob's keypair
const signedPaymentTxn = await paymentTxn.sign({ payer: bob })

// submit the serialized txn to the Blockchain HTTP API
const client = new Client()
client.transactions.submit(signedPaymentTxn.toString())
```
