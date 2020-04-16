import nock from 'nock'
import Client from '..'
import { Network } from '../'

test('exposes a client instance with default options', () => {
  const prodUrl = 'https://api.helium.io'
  const client = new Client()
  expect(client.network.baseURL).toBe(prodUrl)
})

test('configure client with different endpoint', () => {
  const stagingUrl = 'https://api.helium.wtf'
  const client = new Client(Network.staging)
  expect(client.network.baseURL).toBe(stagingUrl)
})

describe('get', () => {
  it('creates a GET request to the full url', async () => {
    nock('https://api.helium.io')
      .get('/v1/greeting')
      .reply(200, {
        greeting: 'hello',
      })

    const client = new Client()

    const { data } = await client.get('/greeting')

    expect(data.greeting).toBe('hello')
  })
})

describe('post', () => {
  it('creates a POST request to the full url', async () => {
    nock('https://api.helium.io')
      .post('/v1/greeting', { greeting: 'hello' })
      .reply(200, {
        response: 'hey there!',
      })
    const client = new Client()
    const params = { greeting: 'hello' }

    const { data } = await client.post('/greeting', params)
    expect(data.response).toBe('hey there!')
  })
})
