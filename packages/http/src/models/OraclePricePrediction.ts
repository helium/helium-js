import Balance, { CurrencyType, USDollars } from '../../../currency/build'
import type Client from '../Client'
import DataModel from './DataModel'

export interface HTTPOraclePricePrediction {
  price: number
  time?: number
}

export type OraclePriceData = Omit<OraclePricePrediction, 'client'>

export default class OraclePricePrediction extends DataModel {
  private client: Client

  public time?: number

  public price?: Balance<USDollars>

  constructor(client: Client, oraclePrice: HTTPOraclePricePrediction) {
    super()
    this.client = client
    this.time = oraclePrice.time
    this.price = new Balance(oraclePrice.price, CurrencyType.usd)
  }

  get data(): OraclePriceData {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { client, ...rest } = this
    return { ...rest }
  }
}
