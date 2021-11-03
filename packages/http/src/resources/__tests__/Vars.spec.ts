import nock from 'nock'
import Client from '../../Client'
import MOCK_CHAIN_VARS from '../__mocks__/varsMock'

const varsFixture = (keys: string[] = []) => {
  const vars = JSON.parse(MOCK_CHAIN_VARS)
  return Object.keys(vars)
    .filter((key) => keys.includes(key))
    .reduce((res, key) => Object.assign(res, { [key]: vars[key] }), {})
}

describe('get vars', () => {
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
    .get('/v1/vars?keys=txn_fee_multiplier%2Cdc_payload_size%2Cstaking_fee_txn_assert_location_v1%2Cstaking_fee_txn_add_gateway_v1%2Cpoc_v4_prob_no_rssi')
    .reply(200, {
      data: varsFixture([
        'txn_fee_multiplier',
        'dc_payload_size',
        'staking_fee_txn_assert_location_v1',
        'staking_fee_txn_add_gateway_v1',
        'poc_v4_prob_no_rssi',
      ]),
    })

  it('retrieves txn chain vars by default', async () => {
    const client = new Client()
    const vars = await client.vars.get()
    expect(vars.txnFeeMultiplier).toBe(5000)
    expect(vars.dcPayloadSize).toBe(24)
    expect(vars.stakingFeeTxnAssertLocationV1).toBe(1000000)
    expect(vars.stakingFeeTxnAddGatewayV1).toBe(4000000)
  })

  it('retrieves txn chain vars and extra', async () => {
    const client = new Client()
    const vars = await client.vars.get(['poc_v4_prob_no_rssi'])
    expect(vars.txnFeeMultiplier).toBe(5000)
    expect(vars.dcPayloadSize).toBe(24)
    expect(vars.stakingFeeTxnAssertLocationV1).toBe(1000000)
    expect(vars.stakingFeeTxnAddGatewayV1).toBe(4000000)
    expect(vars.pocV4ProbNoRssi).toBe(0.5)
  })
})
