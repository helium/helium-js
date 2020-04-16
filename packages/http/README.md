# `@helium/crypto`
![npm](https://img.shields.io/npm/v/@helium/crypto)

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
client.endpoint //= https://api.helium.io/v1
```

To specify a specific network, such as staging, the client can be initialized with a `Network` instance
```js
import { Client, Network } from '@helium/http'
const client = new Client(Network.staging)
client.endpoint //= https://api.helium.wtf/v1
```

##### Networks

| Network | Base URL | Version |
|----------------------|--------------------------|---------|
| `Network.production` | https://api.helium.io | v1 |
| `Network.staging` | https://api.helium.wtf | v1 |

### Paginating Results

#### Automatic Pagination

```js
for await (const account of client.accounts.list()) {
  // do something with account

  // after some condition is met, stop iterating
  if (someConditionMet)
    break
}
```

#### Manual Pagination

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

#### Blocks

#### Transactions
