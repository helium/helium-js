/* eslint-disable max-classes-per-file */
import camelcaseKeys from 'camelcase-keys'
import { Balance, CurrencyType, DataCredits, NetworkTokens } from '@helium/currency'
import Challenge, { HTTPChallengeObject } from './Challenge'
import DataModel, { GenericDataModel } from './DataModel'

export interface TxnJsonObject {
  type: string
  amount?: number
  payments?: any[]
  rewards?: any[]
  fee?: number
}

export class AddGatewayV1 extends DataModel {
  type!: string

  time!: number

  stakingFee!: number

  payerSignature!: string

  payer!: string

  ownerSignature!: string

  owner!: string

  height!: number

  hash!: string

  gatewaySignature!: string

  gateway!: string

  fee!: number

  constructor(data: AddGatewayV1) {
    super()
    Object.assign(this, data)
  }

  get data(): AddGatewayV1 {
    return this
  }
}

export class AssertLocationV1 extends DataModel {
  type!: string

  time!: number

  stakingFee!: number

  payerSignature!: string

  payer!: string

  ownerSignature!: string

  owner!: string

  nonce!: number

  location!: string

  lng!: number

  lat!: number

  height!: number

  hash!: string

  gatewaySignature!: string

  gateway!: string

  fee!: number

  constructor(data: AssertLocationV1) {
    super()
    Object.assign(this, data)
  }

  get data(): AssertLocationV1 {
    return this
  }
}

export class PaymentV1 extends DataModel {
  type!: string

  time!: number

  signature!: string

  payer!: string

  payee!: string

  nonce!: number

  height!: number

  hash!: string

  fee!: Balance<DataCredits>

  amount!: Balance<NetworkTokens>

  constructor(data: PaymentV1) {
    super()
    Object.assign(this, data)
  }

  get data(): PaymentV1 {
    return this
  }
}

export class PaymentV2 extends DataModel {
  type!: string

  time!: number

  signature!: string

  payer!: string

  payments!: Payment[]

  nonce!: number

  height!: number

  hash!: string

  fee!: Balance<DataCredits>

  totalAmount!: Balance<NetworkTokens>

  constructor(data: PaymentV2) {
    super()
    Object.assign(this, data)
  }

  get data(): PaymentV2 {
    return this
  }
}

export interface Payment {
  payee: string
  amount: Balance<NetworkTokens>
}

export class RewardsV1 extends DataModel {
  type!: string

  time!: number

  startEpoch!: number

  rewards!: Reward[]

  height!: number

  hash!: string

  endEpoch!: number

  totalAmount!: Balance<NetworkTokens>

  constructor(data: RewardsV1) {
    super()
    Object.assign(this, data)
  }

  get data(): RewardsV1 {
    return this
  }
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
  | PaymentV2
  | RewardsV1
  | AddGatewayV1
  | AssertLocationV1
  | PocReceiptsV1
  | GenericDataModel

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
  public static fromJsonObject(json: TxnJsonObject): AnyTransaction {
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
        return new GenericDataModel(prepareTxn(json))
    }
  }

  static toPaymentV1(json: TxnJsonObject): PaymentV1 {
    const amount = new Balance(json.amount, CurrencyType.default)
    return new PaymentV1(
      prepareTxn({
        ...json,
        amount,
      }),
    )
  }

  static toPaymentV2(json: TxnJsonObject): PaymentV2 {
    const payments = (json.payments || []).map((p) => ({
      ...p,
      amount: new Balance(p.amount, CurrencyType.default),
    }))
    const sumAmount = (json.payments || []).reduce((sum, { amount }) => sum + amount, 0)
    const totalAmount = new Balance(sumAmount, CurrencyType.default)
    return new PaymentV2(
      prepareTxn({
        ...json,
        payments,
        totalAmount,
      }),
    )
  }

  static toAddGatewayV1(json: TxnJsonObject): AddGatewayV1 {
    return new AddGatewayV1(prepareTxn(json))
  }

  static toAssertLocationV1(json: TxnJsonObject): AssertLocationV1 {
    return new AssertLocationV1(prepareTxn(json))
  }

  static toPocReceiptsV1(json: TxnJsonObject): PocReceiptsV1 {
    return new Challenge(json as HTTPChallengeObject)
  }

  static toRewardsV1(json: TxnJsonObject): RewardsV1 {
    const rewards = (json.rewards || []).map((r) => ({
      ...r,
      amount: new Balance(r.amount, CurrencyType.default),
    })) as Reward[]
    const sumAmount = (json.rewards || []).reduce((sum, { amount }) => sum + amount, 0)
    const totalAmount = new Balance(sumAmount, CurrencyType.default)
    return new RewardsV1(
      prepareTxn({
        ...json,
        rewards,
        totalAmount,
      }),
    )
  }
}
