import nock from 'nock'
import Client from '../../Client'

describe('current oracle price', () => {
  nock('https://api.helium.io')
    .get('/v1/oracle/prices/current')
    .reply(200, {
      data: {
        price: 42040700,
        block: 385010,
      },
    })

  it('gets the current price', async () => {
    const client = new Client()
    const price = await client.oracle.getCurrentPrice()
    expect(price.price.integerBalance).toBe(42040700)
    expect(price.height).toBe(385010)
  })
})

describe('oracle price at block', () => {
  nock('https://api.helium.io')
    .get('/v1/oracle/prices/385010')
    .reply(200, {
      data: {
        price: 42040700,
        block: 385010,
      },
    })

  it('gets the price at the specified block', async () => {
    const client = new Client()
    const price = await client.oracle.getPriceAtBlock(385010)
    expect(price.price.integerBalance).toBe(42040700)
    expect(price.height).toBe(385010)
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
        }],
    })

  it('gets the oracle price prediction', async () => {
    const client = new Client()
    const price = await client.oracle.getPredictedPrice()
    expect(price.price.integerBalance).toBe(42040700)
    expect(price.time).toBe(1594410146)
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
        }],
    })

  it('gets the first oracle price prediction', async () => {
    const client = new Client()
    const price = await client.oracle.getPredictedPrice()
    expect(price.price.integerBalance).toBe(42040700)
    expect(price.time).toBe(1594410146)
  })
})

describe('oracle predicted price is empty', () => {
  nock('https://api.helium.io')
    .get('/v1/oracle/predictions')
    .reply(200, {
      data: [],
    })

  it('gets a response with empty data', async () => {
    const client = new Client()
    const price = await client.oracle.getPredictedPrice()
    expect(price).toBeInstanceOf(Array)
    expect(price.length).toBe(0)
    expect(price.price).toBeUndefined()
    expect(price.time).toBeUndefined()
  })
})
