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

test('configure client with different endpoint', () => {
  const stagingUrl = 'https://api.helium.wtf'
  const client = new Client(Network.staging)
  expect(client.network.baseURL).toBe(stagingUrl)
})

describe('get', () => {
  it('creates a GET request to the full url', async () => {
    nock('https://api.helium.io').get('/v1/greeting').reply(200, {
      greeting: 'hello',
    })

    const client = new Client()

    const { data } = await client.get('/greeting')

    expect(data.greeting).toBe('hello')
  })

  it('client passes headers to GET request', async () => {
    const nameHeader = 'name-header-test'
    const userAgentHeader = 'user-agent-test'
    nock('https://api.helium.io')
      .get('/v1/greeting')
      .reply(200, {
        greeting: 'hello',
      })

    const client = new Client(Network.production, { name: nameHeader, userAgent: userAgentHeader })
    const response = await client.get('/greeting')

    expect(response.data.greeting).toBe('hello')
    expect(response.config.headers['x-client-name']).toBe(nameHeader)
    expect(response.config.headers['User-Agent']).toBe(userAgentHeader)
  })
})

describe('post', () => {
  it('creates a POST request to the full url', async () => {
    nock('https://api.helium.io').post('/v1/greeting', { greeting: 'hello' }).reply(200, {
      response: 'hey there!',
    })
    const client = new Client()
    const params = { greeting: 'hello' }

    const { data } = await client.post('/greeting', params)
    expect(data.response).toBe('hey there!')
  })

  it('client passes headers to POST request', async () => {
    const nameHeader = 'name-header-test'
    const userAgentHeader = 'user-agent-test'
    nock('https://api.helium.io').post('/v1/greeting', { greeting: 'hello' }).reply(200, {
      response: 'hey there!',
    })
    const client = new Client(Network.production, { name: nameHeader, userAgent: userAgentHeader })
    const params = { greeting: 'hello' }
    const response = await client.post('/greeting', params)

    expect(response.data.response).toBe('hey there!')
    expect(response.config.headers['x-client-name']).toBe(nameHeader)
    expect(response.config.headers['User-Agent']).toBe(userAgentHeader)
  })
})

describe('retry logic', () => {
  nock('https://api.helium.io').get('/v1/greeting').times(1).reply(503, 'bad gateway')
  nock('https://api.helium.io').get('/v1/greeting').times(1).reply(200, {
    greeting: 'hello',
  })

  it('retries requests with exponential backoff', async () => {
    const client = new Client()
    expect(client.retry).toBe(5)
    const { data } = await client.get('/greeting')
    expect(data.greeting).toBe('hello')
  })
})

describe('retry disabled', () => {
  nock('https://api.helium.io').get('/v1/farewell').times(1).reply(503, 'bad gateway')
  nock('https://api.helium.io').get('/v1/farewell').times(1).reply(200, 'good response')

  it('make request with retry disabled', async () => {
    const client = new Client(Network.production, { retry: 0 })
    expect(client.retry).toBe(0)
    const makeRequest = async () => {
      await client.get('/farewell')
    }
    await expect(makeRequest()).rejects.toThrow('Request failed with status code 503')
  })
})

describe('name', () => {
  it('is initialized with a client name', () => {
    const client = new Client(Network.production, { name: 'Test Client' })
    expect(client.name).toBe('Test Client')
  })

  it('adds an x-client-name header to GET requests when name is set', async () => {
    nock('https://api.helium.io').get('/v1/greeting').reply(200, {
      greeting: 'hello',
    })

    const client = new Client(Network.production, { name: 'Test Client' })
    const { request } = await client.get('/greeting')
    expect(request.headers['x-client-name']).toBe('Test Client')
  })

  it('adds an x-client-name header to POST requests when name is set', async () => {
    nock('https://api.helium.io').post('/v1/greeting', { greeting: 'hello' }).reply(200, {
      response: 'hey there!',
    })

    const client = new Client(Network.production, { name: 'Test Client' })
    const params = { greeting: 'hello' }
    const { request } = await client.post('/greeting', params)
    expect(request.headers['x-client-name']).toBe('Test Client')
  })
})
