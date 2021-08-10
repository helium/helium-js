import Balance, { CurrencyType, USDollars } from '../../../currency/build'
import type Client from '../Client'
import DataModel from './DataModel'

export interface HTTPOraclePrice {
  price: number
  block?: number
  timestamp?: string
}

export type OraclePriceData = Omit<OraclePrice, 'client'>

export default class OraclePrice extends DataModel {
  private client: Client

  public timestamp?: string

  public price?: Balance<USDollars>

  public height?: number

  constructor(client: Client, oraclePrice: HTTPOraclePrice) {
    super()
    this.client = client
    this.timestamp = oraclePrice.timestamp
    this.height = oraclePrice.block
    this.price = new Balance(oraclePrice.price, CurrencyType.usd)
  }

  get data(): OraclePriceData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}
