# `@helium/http`
![npm](https://img.shields.io/npm/v/@helium/http)

An HTTP client for interfacing with the Helium blockchain. For more documentation on the underlying REST API, see the section on the [Helium Developer Site](https://developer.helium.com/blockchain/api).

## Installation

```shell
$ yarn add @helium/http
# or
$ npm install @helium/http
```

## Usage

### Initializing the Client

By default, the client will be initialized with the production network: `https://api.helium.io`
```js
import { Client } from '@helium/http'
const client = new Client()
client.network.endpoint //= https://api.helium.io/v1
```

To specify a specific network, such as staging, the client can be initialized with a `Network` instance
```js
import { Client, Network } from '@helium/http'
const client = new Client(Network.staging)
client.network.endpoint //= https://api.helium.wtf/v1
```

##### Available Networks

| Network | Base URL | Version |
|----------------------|--------------------------|---------|
| `Network.production` | https://api.helium.io | v1 |
| `Network.staging` | https://api.helium.wtf | v1 |

### Paginating Results

#### Automatic Pagination
Resource lists implement an asynchronous iterator, which allows for paginating over the whole collection while abstracting the underlying pages and cursors. This is great for an infinite scrolling UI, for example.

The asynchronous iterator can be used directly via the `for-await-of` syntax:

```js
for await (const account of client.accounts.list()) {
  account //= Account
  // do something with account

  // after some condition is met, stop iterating
  if (someConditionMet)
    break
}
```

There is also a helper, `take`, which returns the items in chunks:
```js
const list = await client.accounts.list()

await list.take(20) //= first 20 accounts
await list.take(20) //= next 20 accounts
```


#### Manual Pagination

If you're on an older version of Node.js or simply want to use the built-in pagination directly, the following methods are provided:

```js
  const firstPage = await client.accounts.list()
  firstPage.data //= [Account, Account, ...]
  firstPage.hasMore //= true

  const nextPage = await firstPage.nextPage()
  firstPage.data //= [Account, Account, ...]
  firstPage.hasMore //= false
```

### Resources

#### Accounts

##### Get an Account

```js
await client.accounts.get('an-account-address')
```

##### List Accounts
```js
await client.accounts.list()
```

##### Get an Accounts Stats

```js
await client.accounts.getStats('an-account-address')
```

#### Blocks
##### Get a Block

```js
// get by block height
await client.blocks.get(12345)

// alternatively get by block hash
await client.blocks.get('a-block-hash')
```

##### List Blocks
```js
await client.blocks.list()
```

##### Current Block Height
```js
await client.blocks.getHeight()
```

#### Stats
##### Get Network Stats
```js
await client.stats.get()
```

#### Transactions
##### Get Transaction Activity for an Account
```js
await client.account('an-account-address').activity.list()

// optionally filter by transaction types
await client.account('an-account-address').activity.list({
  filterTypes: ['payment_v1' ]
})
```

##### Get Transactions from a Block
```js
// inititalize block by height
const block = await client.blocks.get(12345)

// alternatively initialize block by hash
const block = await client.blocks.get('fake-hash')

await block.transactions.list()
```

##### Submit a New Transaction
```js
const serializedTxn = 'a-base64-serialized-txn'
const pendingTxn = await client.transactions.submit(serializedTxn)
pendingTxn //= PendingTransaction
```

See [`@helium/transactions`](https://github.com/helium/helium-js) for instructions on constructing a serialized transaction.

#### Pending Transactions
##### Check Status of Pending Transaction
This returns a ResourceList of pending transactions. In the case that a transaction fails and is submitted again it will return multiple pending transactions.
```js
const pendingTxnsList = await client.pendingTransactions.get('fake-pending-txn-hash')
pendingTxns = await pendingTxnsList.take(100)
```

##### List Pending Transactions for an Account
```js
const list = await client.account('fake-address').pendingTransactions.list()
const pendingTxns = await list.take(10)
pendingTxns //= [PendingTransacion]
```

#### Election Groups

##### Get an Election Group

```js
await client.elections.get('hash')
```

##### List Election Groups
```js
const list = await client.elections.list()
const elections = await list.take(10)
```

#### Price Oracle

##### Get the Current Oracle Price

```js
await client.oracle.getCurrentPrice()
```

#### Cities

##### List all cities with hotspots

```js
const list = await client.cities.list()
const cities = await list.take(10)
```

##### Search for a city

```js
const list = await client.cities.list({ query: 'san francisco' })
const cities = await list.take(10)
```

##### Get specific city data
```js
const city = await client.cities.get('city-id')
```

##### List hotspots in a city
```js
const list = await client.city('city-id').hotspots.list()
const hotspots = await list.take(10)
```
