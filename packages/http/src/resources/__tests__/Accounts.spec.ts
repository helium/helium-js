import nock from 'nock'
import Client from '../../Client'

const accountFixture = (params = {}) => ({
  speculative_nonce: 4,
  sec_nonce: 2,
  sec_balance: 3,
  nonce: 4,
  dc_nonce: 5,
  dc_balance: 6,
  block: 293601,
  balance: 10000,
  address: 'my-address',
  ...params,
})

const accountStatsFixture = (params = {}) => ({
  last_week: [
    {
      timestamp: '2020-06-30T00:00:00.000000Z',
      balance: 1,
    },
  ],
  last_month: [
    {
      timestamp: '2020-06-30T00:00:00.000000Z',
      balance: 1,
    },
    {
      timestamp: '2020-06-29T16:00:00.000000Z',
      balance: 2,
    },
  ],
  last_day: [],
  ...params,
})

describe('get', () => {
  nock('https://api.helium.io').get('/v1/accounts/my-address').reply(200, {
    data: accountFixture(),
  })

  it('retreives a specific account', async () => {
    const client = new Client()
    const account = await client.accounts.get('my-address')
    expect(account.speculativeNonce).toBe(4)
    expect(account.balance?.integerBalance).toBe(10000)
    expect(account.balance?.toString()).toBe('0.0001 HNT')
  })
})

describe('getStats', () => {
  nock('https://api.helium.io').get('/v1/accounts/my-address/stats').reply(200, {
    data: accountStatsFixture(),
  })

  it('retrieves account stats', async () => {
    const client = new Client()
    const stats = await client.accounts.getStats('my-address')
    expect(stats.lastWeek.length).toBe(1)
    expect(stats.lastMonth.length).toBe(2)
    expect(stats.lastDay.length).toBe(0)
  })
})

describe('list', () => {
  describe('with manual pagination', () => {
    nock('https://api.helium.io')
      .get('/v1/accounts')
      .reply(200, {
        data: [
          accountFixture({ address: 'address-1' }),
          accountFixture({ address: 'address-2' }),
        ],
        cursor: 'cursor-1',
      })

    nock('https://api.helium.io')
      .get('/v1/accounts')
      .query({ cursor: 'cursor-1' })
      .reply(200, {
        data: [
          accountFixture({ address: 'address-3' }),
          accountFixture({ address: 'address-4' }),
        ],
      })

    it('lists a page of accounts and exposes pagination functions', async () => {
      const client = new Client()
      const pageOne = await client.accounts.list()
      expect(pageOne.data[0].address).toBe('address-1')
      expect(pageOne.data[1].address).toBe('address-2')

      const pageTwo = await pageOne.nextPage()
      expect(pageTwo.data[0].address).toBe('address-3')
      expect(pageTwo.data[1].address).toBe('address-4')
    })
  })

  describe('with automatic pagination', () => {
    nock('https://api.helium.io')
      .get('/v1/accounts')
      .reply(200, {
        data: [
          accountFixture({ address: 'address-1' }),
          accountFixture({ address: 'address-2' }),
        ],
        cursor: 'cursor-1',
      })

    nock('https://api.helium.io')
      .get('/v1/accounts')
      .query({ cursor: 'cursor-1' })
      .reply(200, {
        data: [
          accountFixture({ address: 'address-3' }),
          accountFixture({ address: 'address-4' }),
        ],
      })

    it('lists accounts as an auto-paginating iterator', async () => {
      const client = new Client()
      const accounts = await client.accounts.list()

      const addresses = []

      for await (const account of accounts) {
        addresses.push(account.address)
      }
      expect(addresses).toEqual([
        'address-1',
        'address-2',
        'address-3',
        'address-4',
      ])
    })
  })
})
