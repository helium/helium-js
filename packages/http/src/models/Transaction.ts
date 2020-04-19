import camelcaseKeys from 'camelcase-keys'
import Balance from './Balance'
import CurrencyType from './CurrencyType'

export interface TxnJsonObject {
  type: string
  amount?: number
  payments?: any[]
  fee?: number
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
  fee: Balance
  amount: Balance
}

export interface PaymentV2 {
  type: string
  time: number
  signature: string
  payer: string
  payments: Payment[]
  nonce: number
  height: number
  hash: string
  fee: Balance
  totalAmount: Balance
}

interface Payment {
  payee: string
  amount: Balance
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
    switch (json.type) {
      case 'payment_v1':
        return this.toPaymentV1(json)
      case 'payment_v2':
        return this.toPaymentV2(json)
      case 'add_gateway_v1':
        return this.toAddGatewayV1(json)
      case 'rewards_v1':
        return this.toAddGatewayV1(json)
      default:
        return camelcaseKeys(json)
    }
  }

  static toPaymentV1(json: TxnJsonObject): PaymentV1 {
    const amount = new Balance(json.amount, CurrencyType.default)
    const fee = new Balance(json.fee, CurrencyType.data_credit)
    return camelcaseKeys({
      ...json,
      amount,
      fee,
    }) as PaymentV1
  }

  static toPaymentV2(json: TxnJsonObject): PaymentV2 {
    const payments = (json.payments || []).map(p => ({
      ...p,
      amount: new Balance(p.amount, CurrencyType.default),
    }))
    const sumAmount = (json.payments || []).reduce(
      (sum, { amount }) => sum + amount,
      0,
    )
    const totalAmount = new Balance(sumAmount, CurrencyType.default)
    const fee = new Balance(json.fee, CurrencyType.data_credit)
    return camelcaseKeys({
      ...json,
      payments,
      fee,
      totalAmount,
    }) as PaymentV2
  }

  static toAddGatewayV1(json: TxnJsonObject): AddGatewayV1 {
    return camelcaseKeys(json as AddGatewayV1)
  }

  static toRewardsV1(json: TxnJsonObject): RewardsV1 {
    return camelcaseKeys(json as RewardsV1)
  }
}
