import camelcaseKeys from 'camelcase-keys'
import {
  Balance,
  CurrencyType,
  DataCredits,
  NetworkTokens,
} from '@helium/currency'
import Challenge, { HTTPChallengeObject } from './Challenge'

export interface TxnJsonObject {
  type: string
  amount?: number
  payments?: any[]
  rewards?: any[]
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

export interface AssertLocationV1 {
  type: string
  time: number
  stakingFee: number
  payerSignature: string
  payer: string
  ownerSignature: string
  owner: string
  nonce: number
  location: string
  lng: number
  lat: number
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
  fee: Balance<DataCredits>
  amount: Balance<NetworkTokens>
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
  fee: Balance<DataCredits>
  totalAmount: Balance<NetworkTokens>
}

export interface Payment {
  payee: string
  amount: Balance<NetworkTokens>
}

export interface RewardsV1 {
  type: string
  time: number
  startEpoch: number
  rewards: Reward[]
  height: number
  hash: string
  endEpoch: number
  totalAmount: Balance<NetworkTokens>
}

export interface Reward {
  type: string
  gateway: string
  amount: Balance<NetworkTokens>
  account: string
}

export interface PocReceiptsV1 extends Challenge {}

export type AnyTransaction =
  | PaymentV1
  | RewardsV1
  | AddGatewayV1
  | AssertLocationV1
  | PocReceiptsV1
  | object

function prepareTxn(txn: any) {
  if (txn.fee) {
    txn.fee = new Balance(txn.fee, CurrencyType.dataCredit)
  }

  if (txn.stakingFee) {
    txn.stakingFee = new Balance(txn.stakingFee, CurrencyType.dataCredit)
  }

  return camelcaseKeys(txn)
}

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
        return this.toRewardsV1(json)
      case 'poc_receipts_v1':
        return this.toPocReceiptsV1(json)
      default:
        return prepareTxn(json)
    }
  }

  static toPaymentV1(json: TxnJsonObject): PaymentV1 {
    const amount = new Balance(json.amount, CurrencyType.default)
    return prepareTxn({
      ...json,
      amount,
    }) as PaymentV1
  }

  static toPaymentV2(json: TxnJsonObject): PaymentV2 {
    const payments = (json.payments || []).map((p) => ({
      ...p,
      amount: new Balance(p.amount, CurrencyType.default),
    }))
    const sumAmount = (json.payments || []).reduce(
      (sum, { amount }) => sum + amount,
      0,
    )
    const totalAmount = new Balance(sumAmount, CurrencyType.default)
    return prepareTxn({
      ...json,
      payments,
      totalAmount,
    }) as PaymentV2
  }

  static toAddGatewayV1(json: TxnJsonObject): AddGatewayV1 {
    return prepareTxn(json) as AddGatewayV1
  }

  static toAssertLocationV1(json: TxnJsonObject): AssertLocationV1 {
    return prepareTxn(json) as AssertLocationV1
  }

  static toPocReceiptsV1(json: TxnJsonObject): PocReceiptsV1 {
    return new Challenge(json as HTTPChallengeObject)
  }

  static toRewardsV1(json: TxnJsonObject): RewardsV1 {
    const rewards = (json.rewards || []).map((r) => ({
      ...r,
      amount: new Balance(r.amount, CurrencyType.default),
    })) as Reward[]
    const sumAmount = (json.rewards || []).reduce(
      (sum, { amount }) => sum + amount,
      0,
    )
    const totalAmount = new Balance(sumAmount, CurrencyType.default)
    return prepareTxn({
      ...json,
      rewards,
      totalAmount,
    }) as RewardsV1
  }
}
