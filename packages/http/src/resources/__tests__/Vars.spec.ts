import nock from 'nock'
import Client from '../../Client'
import MOCK_CHAIN_VARS from '../__mocks__/varsMock'

const varsFixture = (keys: string[] = []) => {
  const vars = JSON.parse(MOCK_CHAIN_VARS)
  if (keys.length === 0) {
    return vars
  }
  return Object.keys(vars)
    .filter((key) => keys.includes(key))
    .reduce((res, key) => Object.assign(res, { [key]: vars[key] }), {})
}

describe('get vars', () => {
  nock('https://api.helium.io')
    .get('/v1/vars')
    .reply(200, {
      data: varsFixture(),
    })

  nock('https://api.helium.io')
    .get('/v1/vars?keys=txn_fee_multiplier%2Cdc_payload_size%2Cstaking_fee_txn_assert_location_v1%2Cstaking_fee_txn_add_gateway_v1')
    .reply(200, {
      data: varsFixture([
        'txn_fee_multiplier',
        'dc_payload_size',
        'staking_fee_txn_assert_location_v1',
        'staking_fee_txn_add_gateway_v1',
      ]),
    })

  nock('https://api.helium.io')
    .get('/v1/vars?keys=poc_v4_prob_no_rssi')
    .reply(200, {
      data: varsFixture([
        'poc_v4_prob_no_rssi',
      ]),
    })

  nock('https://api.helium.io')
    .get('/v1/vars?keys=poc_v4_prob_no_rssi%2Cpoc_addr_hash_byte_count')
    .reply(200, {
      data: varsFixture([
        'poc_v4_prob_no_rssi',
        'poc_addr_hash_byte_count',
      ]),
    })

  it('getAll retrieves all chain vars', async () => {
    const client = new Client()
    const vars = await client.vars.getAll()
    expect(Object.keys(vars).length).toBe(158)
  })

  it('get retrieves txn chain vars by default', async () => {
    const client = new Client()
    const vars = await client.vars.get()
    expect(vars.txnFeeMultiplier).toBe(5000)
    expect(vars.dcPayloadSize).toBe(24)
    expect(vars.stakingFeeTxnAssertLocationV1).toBe(1000000)
    expect(vars.stakingFeeTxnAddGatewayV1).toBe(4000000)
    expect(Object.keys(vars).length).toBe(4)
  })

  it('get retrieves one specific chain var', async () => {
    const client = new Client()
    const vars = await client.vars.get(['poc_v4_prob_no_rssi'])
    expect(vars.pocV4ProbNoRssi).toBe(0.5)
    expect(Object.keys(vars).length).toBe(1)
  })

  it('get retrieves multiple specific chain vars', async () => {
    const client = new Client()
    const vars = await client.vars.get(['poc_v4_prob_no_rssi', 'poc_addr_hash_byte_count'])
    expect(vars.pocV4ProbNoRssi).toBe(0.5)
    expect(vars.pocAddrHashByteCount).toBe(8)
    expect(Object.keys(vars).length).toBe(2)
  })
})
