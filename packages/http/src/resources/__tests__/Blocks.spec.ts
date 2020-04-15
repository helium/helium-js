import nock from 'nock'
import Client from '../../Client'

describe('list', () => {
  it('lists the most recent blocks', async () => {
    nock('https://api.helium.io')
      .get('/v1/blocks')
      .reply(200, {
        data: [
          {
            transaction_count: 51,
            time: 1586715428,
            prev_hash: 'zBDZ1PV8CV8MLcEw-zc-zfjTum381JjVx7iHJxQkQhg',
            height: 289081,
            hash: 'WSvuFjPCvmyzlkW24OSbNAvk0i44q-OBqlMgjsfF3Is',
          },
        ],
      })

    const client = new Client()

    const blocks = await client.blocks.list()
    expect(blocks.length).toBe(1)
    expect(blocks[0].hash).toBe('WSvuFjPCvmyzlkW24OSbNAvk0i44q-OBqlMgjsfF3Is')
  })
})
