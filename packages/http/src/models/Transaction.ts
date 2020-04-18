import camelcaseKeys from 'camelcase-keys'

export interface TxnJsonObject {
  type: string
}

export interface AddGatewayV1 {
  type: string
  time: number
  stakingFee: number
  payerSignature: string
  payer: string
  ownerSignature: string
  owner: string
  height: number
  hash: string
  gatewaySignature: string
  gateway: string
  fee: number
}

export interface PaymentV1 {
  type: string
  time: number
  signature: string
  payer: string
  payee: string
  nonce: number
  height: number
  hash: string
  fee: number
  amount: number
}

export interface RewardsV1 {
  type: string
  time: number
  startEpoch: number
  rewards: Reward[]
  height: number
  hash: string
  endEpoch: number
}

export interface Reward {
  type: string
  gateway: string
  amount: number
  account: string
}

export type AnyTransaction = PaymentV1 | RewardsV1 | AddGatewayV1 | object

export default class Transaction {
  public static fromJsonObject(json: TxnJsonObject) {
    switch(json.type) {
      case 'payment_v1':
        return this.toPaymentV1(json)
      case 'add_gateway_v1':
        return this.toAddGatewayV1(json)
      case 'rewards_v1':
        return this.toAddGatewayV1(json)
      default:
        return camelcaseKeys(json)
    }
  }

  static toAddGatewayV1(json: TxnJsonObject): AddGatewayV1 {
    return camelcaseKeys(json as AddGatewayV1)
  }

  static toPaymentV1(json: TxnJsonObject): PaymentV1 {
    return camelcaseKeys(json as PaymentV1)
  }

  static toRewardsV1(json: TxnJsonObject): RewardsV1 {
    return camelcaseKeys(json as RewardsV1)
  }
}
