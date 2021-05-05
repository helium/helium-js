/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */
import camelcaseKeys from 'camelcase-keys'
import {
  Balance, CurrencyType, DataCredits, NetworkTokens,
} from '@helium/currency'
import Challenge, { HTTPChallengeObject } from './Challenge'
import DataModel from './DataModel'

export interface TxnJsonObject {
  type: string
  amount?: number
  payments?: any[]
  rewards?: any[]
  fee?: number
  amount_to_seller?: number
}

export class AddGatewayV1 extends DataModel {
  type!: string

  time!: number

  stakingFee!: Balance<DataCredits>

  payerSignature!: string

  payer!: string

  ownerSignature!: string

  owner!: string

  height!: number

  hash!: string

  gatewaySignature!: string

  gateway!: string

  fee!: Balance<DataCredits>

  constructor(data: AddGatewayV1) {
    super()
    Object.assign(this, data)
  }

  get data(): AddGatewayV1 {
    return this
  }
}

export class TokenBurnV1 extends DataModel {
  type!: string

  time!: number

  payer!: string

  payee!: string

  nonce!: number

  memo!: string

  height!: number

  hash!: string

  fee!: Balance<DataCredits>

  amount!: Balance<NetworkTokens>

  constructor(data: TokenBurnV1) {
    super()
    Object.assign(this, data)
  }

  get data(): TokenBurnV1 {
    return this
  }
}

export class AssertLocationV1 extends DataModel {
  type!: string

  time!: number

  stakingFee!: Balance<DataCredits>

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

  fee!: Balance<DataCredits>

  constructor(data: AssertLocationV1) {
    super()
    Object.assign(this, data)
  }

  get data(): AssertLocationV1 {
    return this
  }
}

export class AssertLocationV2 extends DataModel {
  type!: string

  time!: number

  stakingFee!: Balance<DataCredits>

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

  gateway!: string

  gain!: number

  fee!: Balance<DataCredits>

  elevation!: number

  constructor(data: AssertLocationV2) {
    super()
    Object.assign(this, data)
  }

  get data(): AssertLocationV2 {
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

export class UnknownTransaction extends DataModel {
  type!: string

  time!: number

  constructor(data: UnknownTransaction) {
    super()
    Object.assign(this, data)
  }

  get data(): UnknownTransaction {
    return this
  }
}

export interface Payment {
  payee: string
  amount: Balance<NetworkTokens>
  memo?: string
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

export class RewardsV2 extends RewardsV1 {}

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
  | RewardsV2
  | AddGatewayV1
  | AssertLocationV1
  | PocReceiptsV1
  | TransferHotspotV1
  | TokenBurnV1
  | UnknownTransaction

function prepareTxn(txn: any) {
  if (txn.fee && typeof txn.fee === 'number') {
    txn.fee = new Balance(txn.fee, CurrencyType.dataCredit)
  }

  if (txn.staking_fee && typeof txn.staking_fee === 'number') {
    txn.staking_fee = new Balance(txn.staking_fee, CurrencyType.dataCredit)
  }

  if (txn.amount && typeof txn.amount === 'number') {
    txn.amount = new Balance(txn.amount, CurrencyType.networkToken)
  }

  if (txn.total_amount && typeof txn.total_amount === 'number') {
    txn.total_amount = new Balance(txn.total_amount, CurrencyType.networkToken)
  }

  if (txn.amount_to_seller && typeof txn.amount_to_seller === 'number') {
    txn.amount_to_seller = new Balance(txn.amount_to_seller, CurrencyType.networkToken)
  }
  return camelcaseKeys(txn)
}

export class TransferHotspotV1 extends DataModel {
  type!: string

  time!: number

  seller!: string

  height!: number

  hash!: string

  gateway!: string

  buyerNonce!: number

  buyer!: string

  fee!: Balance<DataCredits>

  amountToSeller!: Balance<NetworkTokens>

  constructor(data: TransferHotspotV1) {
    super()
    Object.assign(this, data)
  }

  get data(): TransferHotspotV1 {
    return this
  }
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
      case 'rewards_v2':
        return this.toRewardsV2(json)
      case 'poc_receipts_v1':
        return this.toPocReceiptsV1(json)
      case 'transfer_hotspot_v1':
        return this.toTransferHotspotV1(json)
      case 'assert_location_v1':
        return this.toAssertLocationV1(json)
      case 'assert_location_v2':
        return this.toAssertLocationV2(json)
      case 'token_burn_v1':
        return this.toTokenBurnV1(json)
      default:
        return this.toUnknownTransaction(json)
    }
  }

  static toPaymentV1(json: TxnJsonObject): PaymentV1 {
    return new PaymentV1(prepareTxn(json))
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

  static toAssertLocationV2(json: TxnJsonObject): AssertLocationV2 {
    return new AssertLocationV2(prepareTxn(json))
  }

  static toTokenBurnV1(json: TxnJsonObject): TokenBurnV1 {
    return new TokenBurnV1(prepareTxn(json))
  }

  static toUnknownTransaction(json: TxnJsonObject): UnknownTransaction {
    return new UnknownTransaction(prepareTxn(json))
  }

  static toPocReceiptsV1(json: TxnJsonObject): PocReceiptsV1 {
    return new Challenge(json as HTTPChallengeObject)
  }

  static toTransferHotspotV1(json: TxnJsonObject): TransferHotspotV1 {
    return new TransferHotspotV1(prepareTxn(json))
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

  static toRewardsV2(json: TxnJsonObject): RewardsV2 {
    return this.toRewardsV1(json)
  }
}
