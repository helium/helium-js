import nock from 'nock'
import Client from '../../Client'

const stateChannelFixture = (params = {}) => ({
  type: 'state_channel_close_v1',
  time: 1627937344,
  state_channel: {
    summaries: [
      {
        owner: 'fake-owner-address',
        num_packets: 14,
        num_dcs: 28,
        location: 'fake-location',
        client: 'fake-client-address',
      },
    ],
    state: 'closed',
    root_hash: 'fake-root-hash',
    owner: 'fake-owner-address',
    nonce: 23438,
    id: 'fake-id',
    expire_at_block: 949404,
  },
  height: 949410,
  hash: 'fake-hash',
  conflicts_with: null,
  closer: 'fake-closer-address',
  ...params,
})

describe('list', () => {
  nock('https://api.helium.io')
    .get('/v1/state_channels')
    .reply(200, {
      data: [stateChannelFixture({ hash: 'fake-hash-1' }), stateChannelFixture({ hash: 'fake-hash-2' })],
    })

  it('lists state channels', async () => {
    const client = new Client()
    const list = await client.stateChannels.list()
    const stateChannels = await list.take(2)
    expect(stateChannels[0].hash).toBe('fake-hash-1')
    expect(stateChannels[0].stateChannel.state).toBe('closed')
    expect(stateChannels[0].stateChannel.rootHash).toBe('fake-root-hash')
    expect(stateChannels[0].stateChannel.summaries[0].numDcs).toBe(28)
    expect(stateChannels[1].hash).toBe('fake-hash-2')
  })
})
