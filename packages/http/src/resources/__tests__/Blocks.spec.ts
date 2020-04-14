import axios from 'axios'
import Client from '../../Client'

jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>
// const mockedAxios = axios

describe('list', () => {
  it('lists the most recent blocks', async () => {
    const client = new Client()

    const resp = {
      data: [
        {
          transaction_count: 51,
          time: 1586715428,
          prev_hash: 'zBDZ1PV8CV8MLcEw-zc-zfjTum381JjVx7iHJxQkQhg',
          height: 289081,
          hash: 'WSvuFjPCvmyzlkW24OSbNAvk0i44q-OBqlMgjsfF3Is',
        },
      ],
    }

    mockedAxios.get.mockResolvedValue({ data: resp })

    const blocks = await client.blocks.list()
    expect(blocks.length).toBe(1)
    expect(blocks[0].hash).toBe('WSvuFjPCvmyzlkW24OSbNAvk0i44q-OBqlMgjsfF3Is')
  })
})
