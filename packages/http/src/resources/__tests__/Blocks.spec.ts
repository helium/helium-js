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
    expect(blocks.data.length).toBe(1)
    expect(blocks.data[0].hash).toBe(
      'WSvuFjPCvmyzlkW24OSbNAvk0i44q-OBqlMgjsfF3Is',
    )
  })
})

describe('get', () => {
  nock('https://api.helium.io')
    .get('/v1/blocks/289081')
    .reply(200, {
      data: {
        transaction_count: 51,
        time: 1586715428,
        prev_hash: 'zBDZ1PV8CV8MLcEw-zc-zfjTum381JjVx7iHJxQkQhg',
        height: 289081,
        hash: 'WSvuFjPCvmyzlkW24OSbNAvk0i44q-OBqlMgjsfF3Is',
      },
    })

  it('gets a block by height', async () => {
    const client = new Client()

    const block = await client.blocks.get(289081)
    expect(block.hash).toBe('WSvuFjPCvmyzlkW24OSbNAvk0i44q-OBqlMgjsfF3Is')
  })
})

describe('getHash', () => {
  nock('https://api.helium.io')
    .get('/v1/blocks/hash/WSvuFjPCvmyzlkW24OSbNAvk0i44q-OBqlMgjsfF3Is')
    .reply(200, {
      data: {
        transaction_count: 51,
        time: 1586715428,
        prev_hash: 'zBDZ1PV8CV8MLcEw-zc-zfjTum381JjVx7iHJxQkQhg',
        height: 289081,
        hash: 'WSvuFjPCvmyzlkW24OSbNAvk0i44q-OBqlMgjsfF3Is',
      },
    })

  it('gets a block by height', async () => {
    const client = new Client()

    const block = await client.blocks.getHash('WSvuFjPCvmyzlkW24OSbNAvk0i44q-OBqlMgjsfF3Is')
    expect(block.height).toBe(289081)
  })
})
