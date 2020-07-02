import nock from 'nock'
import Client from '../../Client'

const electionsFixture = (params = {}) => ({
  type: 'consensus_group_v1',
  time: 1234567890,
  proof: 'fake-proof',
  members: [
    'fake1',
    'fake2',
    'fake3',
    'fake4',
    'fake5',
  ],
  height: 123456,
  hash: 'fake-hash',
  delay: 0,
  ...params,
})

describe('get', () => {
  nock('https://api.helium.io')
    .get('/v1/transactions/fake-hash')
    .reply(200, {
      data: electionsFixture(),
    })

  it('retrieves an election by hash', async () => {
    const client = new Client()
    const election = await client.elections.get('fake-hash')
    expect(election.hash).toBe('fake-hash')
  })
})

describe('list', () => {
  nock('https://api.helium.io')
    .get('/v1/elections')
    .reply(200, {
      data: [
        electionsFixture({ hash: 'fake-hash-1' }),
        electionsFixture({ hash: 'fake-hash-2' }),
      ],
    })

  it('lists elections', async () => {
    const client = new Client()
    const list = await client.elections.list()
    const elections = await list.take(2)
    expect(elections[0].hash).toBe('fake-hash-1')
    expect(elections[1].hash).toBe('fake-hash-2')
  })
})
