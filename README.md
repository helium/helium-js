# helium-js

This is a monorepo containing the following TypeScript packages for interacting with the Helium blockchain:

##### [@helium/crypto](https://github.com/helium/helium-js/tree/master/packages/crypto)
Cryptography utilities including keypairs, mnemonics and base58-check encoding

##### [@helium/transactions](https://github.com/helium/helium-js/tree/master/packages/transactions)
Construct and serialize transaction primatives from their [protobuf](https://developers.google.com/protocol-buffers) definitions

##### [@helium/http](https://github.com/helium/helium-js/tree/master/packages/http)
An HTTP client for the blockchain REST API

##### @helium/cli _(coming soon)_
A CLI for managing accounts locally and querying the blockchain API

#### Disclaimer!
These libraries are currently in development and are provided as-is. Helium makes no claims or guarantees about the reliability or security of this code. PRs welcome, see [CONTRIBUTING](https://github.com/heilum/helium-js/blob/master/CONTRIBUTING.md).

## Installation
Each package can be installed independently depending on what utility you need. For example:

```bash
$ yarn add @helium/crypto @helium/transactions @helium/http
```

## Usage
Here are some high-level examples detailing how these packages can be used in combination to accomplish some common tasks.

### Creating and submitting a payment transaction

```js
import { Keypair } from '@helium/crypto'
import { Payment } from '@helium/transactions'
import { Client } from '@helium/http'

// initialize two keypairs, one from a 12 word mnemonic, and the other random
const bob = await Keypair.fromWords(['one', 'two', ..., 'twelve'])
const alice = await Keypair.makeRandom()

// construct a payment txn
const paymentTxn = new Payment({
  payer: bob.address,
  payee: alice.address,
  amount: 10,
  fee: 0,
  nonce: 1,
})

// sign the payment txn with bob's keypair
await paymentTxn.sign({ payer: bob })

// submit the serialized txn to the Blockchain HTTP API
const client = new Client()
client.transactions.submit(paymentTxn.serialize())
```
