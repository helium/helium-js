# `@helium/currency`
![npm](https://img.shields.io/npm/v/@helium/currency)

Utilities for handling the different currency types on the Helium blockchain. For more details see the following resources:

- https://www.helium.com/tokens
- https://developer.helium.com/blockchain/mining-token-rewards
- https://developer.helium.com/blockchain/tokens

## Installation

```shell
$ yarn add @helium/currency
# or
$ npm install @helium/currency
```

## Usage

`@helium/currency` has two main concepts:

- `Balance`
- `CurrencyType`

A `Balance` represents an amount of one of the supported `CurrencyType`s. The following currency types are supported:

- Network Tokens (HNT) (`CurrencyType.networkToken`)
- Data Credits (DC) (`CurrencyType.dataCredit`)
- Security Tokens (HST) (`CurrencyType.security`)
- US Dollars (USD) (`CurrencyType.usd`)


### Basic Usage
Balances are constructed with their integer value representation, since this is how the API returns them.

```js
import { Balance, CurrencyType } from '@helium/currency'

const hntBalance = new Balance(100000000, CurrencyType.networkToken)
hntBalance.toString() // 1 HNT

const dcBalance = new Balance(10, CurrencyType.dataCredit)
dcBalance.toString() // 10 DC

const hstBalance = new Balance(100000000, CurrencyType.security)
hstBalance.toString() // 1 HST

const usdBalance = new Balance(100000000, CurrencyType.usd)
usdBalance.toString() // 1 USD
```

> :point_up: note that the Helium blockchain represents USD with 8 decimal places, when displaying oracle prices for example.

### Arithmetic Operations
Balances can be added or subtracted from each other, and a balance can be multiplied by or divided by a number. This takes advantage of the underlying `bignumber.js` library for handling large numbers accurately without running into floating point errors.

```js
import { Balance, CurrencyType } from '@helium/currency'

const hntBalanceA = new Balance(100000000, CurrencyType.networkToken)
const hntBalanceB = new Balance(600000000, CurrencyType.networkToken)

hntBalanceA.plus(hntBalanceB).toString() // 7 HNT
hntBalanceB.minus(hntBalanceA).toString() // 5 HNT
hntBalanceB.times(2).toString() // 12 HNT
hntBalanceB.dividedBy(2).toString() // 3 HNT
```

### Conversions
Balances can be converted between HNT, DC and USD. Some of these conversions require the consultation of a price oracle. A price oracle is the current value of HNT in USD as understood by the Helium blockchain for the purpose of burning HNT to DC. The current price oracle value can be retrived using `@helium/http`

```js
import { Client } from '@helium/http'
import { Balance, CurrencyType } from '@helium/currency'

const client = new Client()
const oraclePrice = await client.oracle.getCurrentPrice().price
// OR
const oraclePrice = new Balance(0.45 * 100000000, CurrencyType.usd)

const hntBalance = new Balance(10 * 100000000, CurrencyType.networkToken)
hntBalance.toUsd(oraclePrice).toString(2) // 4.50 USD
hntBalance.toDataCredits(oraclePrice).toString() // 450,000 DC

const dcBalance = new Balance(10 * 100000, CurrencyType.dataCredit)
dcbalance.toNetworkTokens(oraclePrice).toString(2) // 22.22 HNT
dcbalance.toUsd().toString(2) // 10 USD

const usdBalance = new Balance(10 * 10000000, CurrencyType.usd)
usdBalance.toNetworkTokens(oraclePrice).toString(2) // 22.22 HNT
usdBalance.toDataCredits().toString() // 1,000,000 DC
```
