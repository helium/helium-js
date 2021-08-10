import nock from 'nock'
import Client from '../../Client'

describe('current oracle price', () => {
  nock('https://api.helium.io')
    .get('/v1/oracle/prices/current')
    .reply(200, {
      data: {
        timestamp: '2021-08-10T18:09:48.000000Z',
        price: 1549650000,
        block: 959820,
      },
    })

  it('gets the current price', async () => {
    const client = new Client()
    const price = await client.oracle.getCurrentPrice()
    expect(price?.price?.integerBalance).toBe(1549650000)
    expect(price.height).toBe(959820)
    expect(price.timestamp).toBe('2021-08-10T18:09:48.000000Z')
  })
})

describe('listPrices', () => {
  nock('https://api.helium.io')
    .get('/v1/oracle/prices')
    .reply(200, {
      data: [
        {
          timestamp: '2021-08-10T18:09:48.000000Z',
          price: 1549650000,
          block: 959820,
        },
        {
          timestamp: '2021-08-10T16:34:02.000000Z',
          price: 1425951500,
          block: 959740,
        },
      ],
    })

  it('lists oracle prices', async () => {
    const client = new Client()
    const list = await client.oracle.listPrices()
    const [price1, price2] = await list.take(2)
    expect(price1?.price?.integerBalance).toBe(1549650000)
    expect(price1.timestamp).toBe('2021-08-10T18:09:48.000000Z')
    expect(price1.height).toBe(959820)
    expect(price2?.price?.integerBalance).toBe(1425951500)
    expect(price2.timestamp).toBe('2021-08-10T16:34:02.000000Z')
    expect(price2.height).toBe(959740)
  })
})

describe('oracle price at block', () => {
  nock('https://api.helium.io')
    .get('/v1/oracle/prices/385010')
    .reply(200, {
      data: {
        timestamp: '2020-06-23T15:45:33.000000Z',
        price: 42040700,
        block: 385010,
      },
    })

  it('gets the price at the specified block', async () => {
    const client = new Client()
    const price = await client.oracle.getPriceAtBlock(385010)
    expect(price?.price?.integerBalance).toBe(42040700)
    expect(price.height).toBe(385010)
    expect(price.timestamp).toBe('2020-06-23T15:45:33.000000Z')
  })
})

describe('oracle predicted price exists', () => {
  nock('https://api.helium.io')
    .get('/v1/oracle/predictions')
    .reply(200, {
      data: [
        {
          price: 42040700,
          time: 1594410146,
        },
      ],
    })

  it('gets the oracle price prediction', async () => {
    const client = new Client()
    const price = await client.oracle.getPredictedPrice()
    expect(price[0]?.price?.integerBalance).toBe(42040700)
    expect(price[0].time).toBe(1594410146)
  })
})

describe('oracle predicted price has multiple values', () => {
  nock('https://api.helium.io')
    .get('/v1/oracle/predictions')
    .reply(200, {
      data: [
        {
          price: 42040700,
          time: 1594410146,
        },
        {
          price: 42040701,
          time: 1594410147,
        },
      ],
    })

  it('gets the first oracle price prediction', async () => {
    const client = new Client()
    const price = await client.oracle.getPredictedPrice()
    expect(price.length).toBe(2)
    expect(price[0]?.price?.integerBalance).toBe(42040700)
    expect(price[0].time).toBe(1594410146)
  })
})

describe('oracle predicted price is empty', () => {
  nock('https://api.helium.io').get('/v1/oracle/predictions').reply(200, {
    data: [],
  })

  it('gets a response with empty data', async () => {
    const client = new Client()
    const price = await client.oracle.getPredictedPrice()
    expect(price).toBeInstanceOf(Array)
    expect(price.length).toBe(0)
  })
})
