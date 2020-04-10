import axios from 'axios'
import Client from '../Client'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

describe('submit', () => {
  it('posts to the pending transactions endpoint', async () => {
    const client = new Client()

    await client.transactions.submit('my txn')

    expect(mockedAxios.post).toHaveBeenCalledWith(
      'https://api.helium.io/v1/pending_transactions',
      { txn: 'my txn' },
    )
  })
})
