import camelcaseKeys from 'camelcase-keys'
import type Client from '../Client'

interface TransactionVars {
  txnFeeMultiplier?: number
  dcPayloadSize?: number
  stakingFeeTxnAssertLocationV1?: number
  stakingFeeTxnAddGatewayV1?: number
}

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

  private baseUrl = '/vars'

  constructor(client: Client) {
    this.client = client
  }

  /**
   * Fetches the chain vars required to configure helium-js for blockchain transactions.
   */
  async getTransactionVars(): Promise<TransactionVars> {
    const { data: { data: vars } } = await this.client.get(this.baseUrl, { keys: this.TXN_VARS.join(',') })
    return camelcaseKeys(vars)
  }

  /**
   * Fetches the specific chain vars passed in keys. If called without keys it will fetch the
   * transaction vars returned by {@link getTransactionVars}.
   * @param keys array of chain vars to fetch eg 'poc_v4_prob_no_rssi'
   */
  async get(keys: string[] = []): Promise<any> {
    if (keys.length === 0) {
      return this.getTransactionVars()
    }
    const { data: { data: vars } } = await this.client.get(this.baseUrl, { keys: keys.join(',') })
    return camelcaseKeys(vars)
  }

  /**
   * WARNING: This will be return over 10 MB of data.
   * Fetches all chain vars.
   */
  async getAll(): Promise<any> {
    const { data: { data: vars } } = await this.client.get(this.baseUrl)
    return camelcaseKeys(vars)
  }
}
