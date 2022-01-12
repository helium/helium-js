# `@helium/onboarding`

![npm](https://img.shields.io/npm/v/@helium/onboarding)
An HTTP client for interfacing with an onboarding server

## Installation

```shell
$ yarn add @helium/onboarding
# or
$ npm install @helium/onboarding
```

## Usage

```ts
import { Client } from '@helium/onboarding'
const client = new Client()

// Or pass your own custom base url
const client = new Client('https://onboarding.you.com/api')

const { data: record } = await client.getOnboardingRecord(hotspotAddress)
console.log(record?.publicAddress)
```
