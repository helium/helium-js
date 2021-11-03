import camelcaseKeys from 'camelcase-keys'
import type Client from '../Client'

export default class Vars {
  private client!: Client

  /**
   * The chain vars needed for transaction configuration.
   * @private
   */
  private TXN_VARS: string[] = [
    'txn_fee_multiplier',
    'dc_payload_size',
    'staking_fee_txn_assert_location_v1',
    'staking_fee_txn_add_gateway_v1',
  ]

  constructor(client: Client) {
    this.client = client
  }

  /**
   * Fetches chain vars passed in keys and default includes the {@link TXN_VARS}:
   * 'txn_fee_multiplier'
   * 'dc_payload_size'
   * 'staking_fee_txn_assert_location_v1'
   * 'staking_fee_txn_add_gateway_v1'
   * @param keys array of extra chain vars to fetch eg 'poc_v4_prob_no_rssi'
   */
  async get(keys: string[] = []): Promise<any> {
    const url = '/vars'
    const { data: { data: vars } } = await this.client.get(url, { keys: [...this.TXN_VARS, ...keys].join(',') })
    return camelcaseKeys(vars)
  }
}
