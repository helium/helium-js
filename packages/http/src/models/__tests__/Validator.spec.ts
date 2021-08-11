import Client from '../../Client'
import Validator from '../Validator'

const mockHTTPValidator = {
  version_heartbeat: 10000008,
  status: { online: 'online', listen_addrs: ['/ip4/11.111.111.111/tcp/2154'], height: 923303 },
  stake_status: 'staked',
  stake: 1000000000000,
  penalty: 1.123,
  consensus_groups: 20,
  penalties: [
    { type: 'performance', height: 921773, amount: 0.099 },
    { type: 'tenure', height: 921622, amount: 0.5 },
  ],
  owner: 'fake-owner-address',
  name: 'fake-name',
  last_heartbeat: 923338,
  block_added: 123456,
  block: 923409,
  address: 'fake-address',
}

test('create Hotspot from HTTP response', () => {
  const validator = new Validator(new Client(), mockHTTPValidator)
  expect(validator.versionHeartbeat).toBe(10000008)
  expect(validator.status?.online).toBe('online')
  expect(validator.status?.listenAddrs?.[0]).toBe('/ip4/11.111.111.111/tcp/2154')
  expect(validator.status?.height).toBe(923303)
  expect(validator.stakeStatus).toBe('staked')
  expect(validator.stake?.integerBalance).toBe(1000000000000)
  expect(validator.penalty).toBe(1.123)
  expect(validator.penalties?.[0]?.type).toBe('performance')
  expect(validator.penalties?.[0]?.height).toBe(921773)
  expect(validator.penalties?.[0]?.amount).toBe(0.099)
  expect(validator.owner).toBe('fake-owner-address')
  expect(validator.name).toBe('fake-name')
  expect(validator.lastHeartbeat).toBe(923338)
  expect(validator.blockAdded).toBe(123456)
  expect(validator.block).toBe(923409)
  expect(validator.address).toBe('fake-address')
  expect(validator.consensusGroups).toBe(20)
})
