import axios from 'axios'
import Client from '../Client'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

test('exposes a client instance with default options', () => {
  const prodUrl = 'https://api.helium.io'
  const client = new Client()
  expect(client.endpoint).toBe(prodUrl)
})

test('configure client with different endpoint', () => {
  const stagingUrl = 'https://api.helium.wtf'
  const client = new Client({ endpoint: stagingUrl })
  expect(client.endpoint).toBe(stagingUrl)
})

test('configure client with different version', () => {
  const client = new Client({ version: 2 })
  expect(client.version).toBe(2)
})

describe('http methods', () => {
  it('posts requests to the full url', async () => {
    const client = new Client()
    const params = { greeting: 'hello' }

    await client.post('/greeting', params)

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.helium.io/v1/greeting',
      params,
    )
  })
})
