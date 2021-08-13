import nock from 'nock'
import Client from '../../Client'

describe('network rewards', () => {
  nock('https://api.helium.io')
    .get('/v1/rewards/sum')
    .query({ min_time: '2021-08-10T20:52:31.000Z', max_time: '2021-08-12T20:52:31.000Z' })
    .reply(200, {
      meta: {
        min_time: '2021-08-10T20:52:31Z',
        max_time: '2021-08-12T20:52:31Z',
      },
      data: {
        total: 135969.9014177,
        sum: 13596990141770,
        stddev: 95.66393764,
        min: 1736.1102804,
        median: 1763.31007719,
        max: 2388.88886435,
        avg: 1789.0776502328947,
      },
    })

  it('gets network-wide reward sum', async () => {
    const client = new Client()
    const rewards = await client.rewards.sum.get(
      new Date('2021-08-10T20:52:31Z'),
      new Date('2021-08-12T20:52:31Z'),
    )
    expect(rewards.total).toBe(135969.9014177)
  })
})

describe('network reward buckets', () => {
  nock('https://api.helium.io')
    .get('/v1/rewards/sum')
    .query({ min_time: '-2 day', bucket: 'day' })
    .reply(200, {
      meta: {
        min_time: '2021-08-10T20:52:31Z',
        max_time: '2021-08-12T20:52:31Z',
        bucket: 'day',
      },
      data: [
        {
          total: 66792.82131172,
          timestamp: '2021-08-11T20:52:31.000000Z',
          sum: 6679282131172,
          stddev: 119.35175692,
          min: 1736.1102804,
          median: 1790.50922556,
          max: 2388.88886435,
          avg: 1805.2113868032432,
        },
        {
          total: 67440.96954704,
          timestamp: '2021-08-10T20:52:31.000000Z',
          sum: 6744096954704,
          stddev: 64.37455766,
          min: 1736.11072424,
          median: 1736.111119075,
          max: 2062.49992508,
          avg: 1774.7623565010526,
        },
      ],
    })

  it('lists network-wide reward sum', async () => {
    const client = new Client()
    const list = await client.rewards.sum.list({ minTime: '-2 day', bucket: 'day' })
    const rewards = await list.take(2)
    expect(rewards[0].total).toBe(66792.82131172)
    expect(rewards[1].total).toBe(67440.96954704)
  })
})
