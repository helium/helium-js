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

describe('get by height', () => {
  beforeEach(() => {
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
  })

  it('gets a block by height', async () => {
    const client = new Client()

    const block = await client.blocks.get(289081)
    expect(block.hash).toBe('WSvuFjPCvmyzlkW24OSbNAvk0i44q-OBqlMgjsfF3Is')
  })

  it('gets a block by height even if it is a string', async () => {
    const client = new Client()

    const block = await client.blocks.get('289081')
    expect(block.hash).toBe('WSvuFjPCvmyzlkW24OSbNAvk0i44q-OBqlMgjsfF3Is')
  })
})

describe('get by hash', () => {
  nock('https://api.helium.io')
    .get('/v1/blocks/hash/12WSvuFjPCvmyzlkW24OSbNAvk0i44q-OBqlMgjsfF3Is')
    .reply(200, {
      data: {
        transaction_count: 51,
        time: 1586715428,
        prev_hash: 'zBDZ1PV8CV8MLcEw-zc-zfjTum381JjVx7iHJxQkQhg',
        height: 289081,
        hash: '12WSvuFjPCvmyzlkW24OSbNAvk0i44q-OBqlMgjsfF3Is',
      },
    })

  it('gets a block by hash', async () => {
    const client = new Client()

    const block = await client.blocks.get(
      '12WSvuFjPCvmyzlkW24OSbNAvk0i44q-OBqlMgjsfF3Is',
    )
    expect(block.height).toBe(289081)
  })
})

describe('getByHashOrHeight', () => {
  it('initializes a Block by height', () => {
    const client = new Client()
    const block = client.block(123)
    expect(block.height).toBe(123)
  })

  it('initializes a Block by height even if passed a string', () => {
    const client = new Client()
    const block = client.block('123')
    expect(block.height).toBe(123)
  })

  it('initializes a Block by hash', () => {
    const client = new Client()
    const block = client.block('some-hash')
    expect(block.hash).toBe('some-hash')
  })

  it('initializes by hash even if there are some numbers', () => {
    const client = new Client()
    const block = client.block('123some-hash')
    expect(block.hash).toBe('123some-hash')
  })
})

describe('get height', () => {
  nock('https://api.helium.io')
    .get('/v1/blocks/height')
    .reply(200, {
      data: {
        height: 369627,
      },
    })

  nock('https://api.helium.io')
    .get('/v1/blocks/height?max_time=mock_max_time')
    .reply(200, {
      data: {
        height: 500000,
      },
    })

  it('gets current block height', async () => {
    const client = new Client()

    const height = await client.blocks.getHeight()
    expect(height).toBe(369627)
  })

  it('gets block height with max time', async () => {
    const client = new Client()

    const height = await client.blocks.getHeight({ maxTime: 'mock_max_time' })
    expect(height).toBe(500000)
  })
})

describe('get stats', () => {
  nock('https://api.helium.io')
    .get('/v1/blocks/stats')
    .reply(200,
      {
        data: {
          last_week: {
            stddev: 27.32198822711437,
            avg: 60.27801036682616,
          },
          last_month: {
            stddev: 45.59651282883883,
            avg: 60.88299879520811,
          },
          last_hour: {
            stddev: 5.753793366763954,
            avg: 51.47826086956522,
          },
          last_day: {
            stddev: 19.444424180975258,
            avg: 55.99481193255512,
          },
        },
      })

  it('gets current block stats', async () => {
    const client = new Client()

    const stats = await client.blocks.stats()
    expect(stats.lastWeek.avg).toBe(60.27801036682616)
    expect(stats.lastMonth.avg).toBe(60.88299879520811)
    expect(stats.lastHour.stddev).toBe(5.753793366763954)
    expect(stats.lastDay.stddev).toBe(19.444424180975258)
  })
})
