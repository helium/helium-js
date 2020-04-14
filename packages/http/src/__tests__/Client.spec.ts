import axios from 'axios'
import Client from '..'
import { Network } from '../'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

test('exposes a client instance with default options', () => {
  const prodUrl = 'https://api.helium.io'
  const client = new Client()
  expect(client.network.endpoint).toBe(prodUrl)
})

test('configure client with different endpoint', () => {
  const stagingUrl = 'https://api.helium.wtf'
  const client = new Client(Network.staging)
  expect(client.network.endpoint).toBe(stagingUrl)
})

describe('get', () => {
  it('creates a GET request to the full url', async () => {
    const client = new Client()

    await client.get('/greeting')

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://api.helium.io/v1/greeting'
    )
  })
})

describe('post', () => {
  it('creates a POST request to the full url', async () => {
    const client = new Client()
    const params = { greeting: 'hello' }

    await client.post('/greeting', params)

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.helium.io/v1/greeting',
      params,
    )
  })
})
