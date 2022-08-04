/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */
import camelcaseKeys from 'camelcase-keys'
import {
  Balance,
  CurrencyType,
  DataCredits,
  NetworkTokens,
  TestNetworkTokens,
  SecurityTokens,
  IotTokens,
  MobileTokens,
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
  token_type?: string
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

  amount!: Balance<NetworkTokens | TestNetworkTokens>

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

  totalAmountHnt!: Balance<NetworkTokens>

  totalAmountMobile!: Balance<MobileTokens>

  totalAmountIot!: Balance<IotTokens>

  constructor(data: PaymentV2) {
    super()
    Object.assign(this, data)
  }

  get data(): PaymentV2 {
    return this
  }
}

export class StakeValidatorV1 extends DataModel {
  type!: string

  time!: number

  stake!: Balance<NetworkTokens>

  ownerSignature!: string

  owner!: string

  fee!: Balance<DataCredits>

  address!: string

  constructor(data: StakeValidatorV1) {
    super()
    Object.assign(this, data)
  }

  get data(): StakeValidatorV1 {
    return this
  }
}

export class UnstakeValidatorV1 extends DataModel {
  type!: string

  time!: number

  stakeReleaseHeight!: number

  stakeAmount!: Balance<NetworkTokens>

  ownerSignature!: string

  owner!: string

  hash!: string

  fee!: Balance<DataCredits>

  address!: string

  constructor(data: UnstakeValidatorV1) {
    super()
    Object.assign(this, data)
  }

  get data(): UnstakeValidatorV1 {
    return this
  }
}

export class TransferValidatorStakeV1 extends DataModel {
  type!: string

  time!: number

  oldAddress!: string

  newAddress!: string

  oldOwner!: string

  newOwner!: string

  oldOwnerSignature!: string

  newOwnerSignature!: string

  fee!: Balance<DataCredits>

  stakeAmount!: Balance<NetworkTokens>

  paymentAmount!: Balance<NetworkTokens>

  constructor(data: TransferValidatorStakeV1) {
    super()
    Object.assign(this, data)
  }

  get data(): TransferValidatorStakeV1 {
    return this
  }
}

interface StateChannelSummary {
  owner: string
  numPackets: number
  numDcs: number
  location: string
  client: string
}

interface StateChannel {
  summaries: StateChannelSummary[]
  state: string
  rootHash: string
  owner: string
  nonce: number
  id: string
  expireAtBlock: number
}

export class StateChannelCloseV1 extends DataModel {
  type!: string

  time!: number

  height!: number

  hash!: string

  stateChannel!: StateChannel

  conflictsWith?: StateChannel

  closer!: string

  constructor(data: StateChannelCloseV1) {
    super()
    Object.assign(this, data)
  }

  get data(): StateChannelCloseV1 {
    return this
  }
}

export class SecurityExchangeV1 extends DataModel {
  type!: string

  time!: number

  payer!: string

  payee!: string

  nonce!: number

  height!: number

  hash!: string

  fee!: Balance<DataCredits>

  amount!: Balance<SecurityTokens>

  constructor(data: SecurityExchangeV1) {
    super()
    Object.assign(this, data)
  }

  get data(): SecurityExchangeV1 {
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
  amount: Balance<NetworkTokens | MobileTokens | IotTokens>
  memo?: string
  max?: boolean
  tokenType: string
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

export interface PocReceiptsV2 extends Challenge {}

export type AnyTransaction =
  | PaymentV1
  | PaymentV2
  | RewardsV1
  | RewardsV2
  | SubnetworkRewardsV1
  | TokenRedeemV1
  | AddGatewayV1
  | AssertLocationV1
  | PocReceiptsV1
  | PocReceiptsV2
  | TransferHotspotV1
  | TransferHotspotV2
  | TokenBurnV1
  | StakeValidatorV1
  | UnstakeValidatorV1
  | TransferValidatorStakeV1
  | SecurityExchangeV1
  | UnknownTransaction

function prepareTxn(txn: any, { deep } = { deep: false }) {
  const balanceConversions = [
    { key: 'fee', currencyType: CurrencyType.dataCredit },
    { key: 'staking_fee', currencyType: CurrencyType.dataCredit },
    { key: 'amount', currencyType: CurrencyType.networkToken },
    { key: 'total_amount', currencyType: CurrencyType.networkToken },
    { key: 'amount_to_seller', currencyType: CurrencyType.networkToken },
    { key: 'stake', currencyType: CurrencyType.networkToken },
    { key: 'payment_amount', currencyType: CurrencyType.networkToken },
    { key: 'stake_amount', currencyType: CurrencyType.networkToken },
  ]

  balanceConversions.forEach(({ key, currencyType }) => {
    if (txn[key] && typeof txn[key] === 'number') {
      if (txn.token_type !== undefined) {
        txn[key] = new Balance(txn[key], CurrencyType.fromTicker(txn.token_type))
      } else {
        txn[key] = new Balance(txn[key], currencyType)
      }
    }
  })

  return camelcaseKeys(txn, { deep })
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

export class TransferHotspotV2 extends DataModel {
  type!: string

  time!: number

  owner!: string

  height!: number

  hash!: string

  gateway!: string

  nonce!: number

  newOwner!: string

  fee!: Balance<DataCredits>

  ownerSignature!: string

  constructor(data: TransferHotspotV2) {
    super()
    Object.assign(this, data)
  }

  get data(): TransferHotspotV2 {
    return this
  }
}

export interface SubnetworkReward {
  account: string
  amount: Balance<MobileTokens | IotTokens>
}

export class SubnetworkRewardsV1 extends DataModel {
  type!: string

  time!: number

  tokenType!: string

  startEpoch!: number

  endEpoch!: number

  rewardServerSignature!: string

  rewards!: Array<SubnetworkReward>

  constructor(data: SubnetworkRewardsV1) {
    super()
    Object.assign(this, data)
  }

  get data(): SubnetworkRewardsV1 {
    return this
  }
}

export class TokenRedeemV1 extends DataModel {
  type!: string

  time!: number

  account!: string

  amount!: Balance<MobileTokens | IotTokens>

  fee!: number

  nonce!: number

  tokenType!: string

  signature!: string

  constructor(data: TokenRedeemV1) {
    super()
    Object.assign(this, data)
  }

  get data(): TokenRedeemV1 {
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
      case 'poc_receipts_v2':
        return this.toPocReceiptsV2(json)
      case 'transfer_hotspot_v1':
        return this.toTransferHotspotV1(json)
      case 'transfer_hotspot_v2':
        return this.toTransferHotspotV2(json)
      case 'assert_location_v1':
        return this.toAssertLocationV1(json)
      case 'assert_location_v2':
        return this.toAssertLocationV2(json)
      case 'token_burn_v1':
        return this.toTokenBurnV1(json)
      case 'unstake_validator_v1':
        return this.toUnstakeValidatorV1(json)
      case 'stake_validator_v1':
        return this.toStakeValidatorV1(json)
      case 'transfer_validator_stake_v1':
        return this.toTransferValidatorStakeV1(json)
      case 'state_channel_close_v1':
        return this.toStateChannelCloseV1(json)
      case 'security_exchange_v1':
        return this.toSecurityExchangeV1(json)
      case 'subnetwork_rewards_v1':
        return this.toSubnetworkRewardsV1(json)
      case 'token_redeem_v1':
        return this.toTokenRedeemV1(json)
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
      amount: new Balance(p.amount,
        p.token_type === undefined || p.token_type === null
          ? CurrencyType.default
          : CurrencyType.fromTicker(p.token_type)),
    }))
    const sumAmountHnt = (json.payments || [])
      .filter(((p) => p.token_type === undefined || p.token_type === 'hnt'))
      .reduce((sum, { amount }) => sum + amount, 0)
    const totalAmountHnt = new Balance(sumAmountHnt, CurrencyType.default)

    const sumAmountMobile = (json.payments || [])
      .filter(((p) => p.token_type === 'mobile'))
      .reduce((sum, { amount }) => sum + amount, 0)
    const totalAmountMobile = new Balance(sumAmountMobile, CurrencyType.mobile)

    const sumAmountIot = (json.payments || [])
      .filter(((p) => p.token_type === 'iot'))
      .reduce((sum, { amount }) => sum + amount, 0)
    const totalAmountIot = new Balance(sumAmountIot, CurrencyType.iot)

    return new PaymentV2(
      prepareTxn({
        ...json,
        payments,
        totalAmountHnt,
        totalAmountMobile,
        totalAmountIot,
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

  static toUnstakeValidatorV1(json: TxnJsonObject): UnstakeValidatorV1 {
    return new UnstakeValidatorV1(prepareTxn(json))
  }

  static toStakeValidatorV1(json: TxnJsonObject): StakeValidatorV1 {
    return new StakeValidatorV1(prepareTxn(json))
  }

  static toTransferValidatorStakeV1(json: TxnJsonObject): TransferValidatorStakeV1 {
    return new TransferValidatorStakeV1(prepareTxn(json))
  }

  static toUnknownTransaction(json: TxnJsonObject): UnknownTransaction {
    return new UnknownTransaction(prepareTxn(json))
  }

  static toPocReceiptsV1(json: TxnJsonObject): PocReceiptsV1 {
    return new Challenge(json as HTTPChallengeObject)
  }

  static toPocReceiptsV2(json: TxnJsonObject): PocReceiptsV2 {
    return new Challenge(json as HTTPChallengeObject)
  }

  static toTransferHotspotV1(json: TxnJsonObject): TransferHotspotV1 {
    return new TransferHotspotV1(prepareTxn(json))
  }

  static toTransferHotspotV2(json: TxnJsonObject): TransferHotspotV2 {
    return new TransferHotspotV2(prepareTxn(json))
  }

  static toStateChannelCloseV1(json: TxnJsonObject): StateChannelCloseV1 {
    return new StateChannelCloseV1(prepareTxn(json, { deep: true }))
  }

  static toSecurityExchangeV1(json: TxnJsonObject): SecurityExchangeV1 {
    return new SecurityExchangeV1(prepareTxn(json))
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

  static toSubnetworkRewardsV1(json: TxnJsonObject): SubnetworkRewardsV1 {
    const currencyType = CurrencyType.fromTicker(json.token_type)
    const rewards = (json.rewards || []).map((r) => ({
      ...r,
      amount: new Balance(r.amount, currencyType),
    })) as SubnetworkReward[]
    return new SubnetworkRewardsV1(
      prepareTxn({
        ...json,
        rewards,
      }),
    )
  }

  static toTokenRedeemV1(json: TxnJsonObject): TokenRedeemV1 {
    return new TokenRedeemV1(prepareTxn(json))
  }
}
