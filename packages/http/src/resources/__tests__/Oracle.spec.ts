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
    expect(price.integerBalance).toBe(42040700)
  })
})
