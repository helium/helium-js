import Transaction, {
  PaymentV2,
  PocReceiptsV1,
  PocReceiptsV2,
  RewardsV1,
  RewardsV2,
  SecurityExchangeV1,
  StakeValidatorV1,
  SubnetworkRewardsV1,
  TokenRedeemV1,
  TransferHotspotV1,
  TransferHotspotV2,
  TransferValidatorStakeV1,
  UnstakeValidatorV1,
} from '../Transaction'
import { HTTPPathObject, HTTPWitnessesObject } from '../Challenge'
import {
  challengeJson,
  mockGeocode,
  mockPathData,
  mockReceipt,
  mockWitness,
} from './Challenge.spec'

describe('StakeValidatorV1', () => {
  it('Creates StakeValidatorV1 transaction', () => {
    const json = {
      type: 'stake_validator_v1',
      time: 1587132741,
      ownerSignature: 'RSXR9pkn9ZnkZOZ',
      owner: '13sSQT9ZAvcDm7U6GizvUWZbHyT24NpNUdkeq8io7XJ9sggf4Yu',
      fee: 3,
      address: 'fake-address',
    }
    const txn = Transaction.fromJsonObject(json) as StakeValidatorV1
    expect(txn.type).toBe('stake_validator_v1')
    expect(txn.time).toBe(1587132741)
    expect(txn.ownerSignature).toBe('RSXR9pkn9ZnkZOZ')
    expect(txn.owner).toBe('13sSQT9ZAvcDm7U6GizvUWZbHyT24NpNUdkeq8io7XJ9sggf4Yu')
    expect(txn.fee.integerBalance).toBe(3)
    expect(txn.address).toBe('fake-address')
  })
})

describe('UnstakeValidatorV1', () => {
  it('Creates UnstakeValidatorV1 transaction', () => {
    const json = {
      time: 1587132741,
      type: 'unstake_validator_v1',
      stake_release_height: 34981,
      stake_amount: 1000000000000,
      owner_signature:
        'AP0mjpyq3Z4Fa7v_XJn9ezvFgJdbkuL6JNXxQejdVPNNR5BGPn6Aai4CZ7_343rn2ykluEKq1Y714Q9DB72OCA',
      owner: '1aMxwNDpFqPtxt85Eco7HCJdaRJL2ogdd3kaHCHkLyoJ7Kfi6xH',
      hash: 'Yf8i7KpE9beoLPfprU4Yty4387KgNST-GrhfkoUkxcE',
      fee: 35000,
      address: '1aMxwNDpFqPtxt85Eco7HCJdaRJL28diswZ8HCHkLyoJ7Kfi6xH',
    }
    const txn = Transaction.fromJsonObject(json) as UnstakeValidatorV1
    expect(txn.type).toBe('unstake_validator_v1')
    expect(txn.time).toBe(1587132741)
    expect(txn.stakeReleaseHeight).toBe(34981)
    expect(txn.stakeAmount.integerBalance).toBe(1000000000000)
    expect(txn.ownerSignature).toBe(
      'AP0mjpyq3Z4Fa7v_XJn9ezvFgJdbkuL6JNXxQejdVPNNR5BGPn6Aai4CZ7_343rn2ykluEKq1Y714Q9DB72OCA',
    )
    expect(txn.owner).toBe('1aMxwNDpFqPtxt85Eco7HCJdaRJL2ogdd3kaHCHkLyoJ7Kfi6xH')
    expect(txn.hash).toBe('Yf8i7KpE9beoLPfprU4Yty4387KgNST-GrhfkoUkxcE')
    expect(txn.fee.integerBalance).toBe(35000)
    expect(txn.address).toBe('1aMxwNDpFqPtxt85Eco7HCJdaRJL28diswZ8HCHkLyoJ7Kfi6xH')
  })
})

describe('TransferValidatorStakeV1', () => {
  it('Creates TransferValidatorStakeV1 transaction', () => {
    const json = {
      type: 'transfer_validator_stake_v1',
      time: 1587132741,
      old_address: '1aMxwNDpFqPtxt85Eco7HCJdaRJL28diswZ8HCHkLyoJ7Kfi6xH',
      new_address: '1aMxwNDpFqPtxt85EkdksuJdaRJL28diswZ8HCHkLyoJ7Kfi6xH',
      old_owner: '1aMxwNDpFqPtxtddkco7HCJdaRJL28diswZ8HCHkLyoJ7Kfi6xH',
      new_owner: '1aMxwNDpFqPtxadekco7HCJdaRJL28diswZ8HCHkLyoJ7Kfi6xH',
      old_owner_signature:
        'AP0mjpyq3Z4Fa7v_XJn9ezvFgJdbkuL6JNXxQejdVPNNR5BGPn6Aai4CZ7_343rn2ykluEKq1Y714Q9DB72OCA',
      new_owner_signature:
        'AP0mjpyq3Z487dtasJn9ezvFgJdbkuL6JNXxQejdVPNNR5BGPn6Aai4CZ7_343rn2ykluEKq1Y714Q9DB72OCA',
      fee: 35000,
      stake_amount: 1000000000000,
      payment_amount: 100000,
    }
    const txn = Transaction.fromJsonObject(json) as TransferValidatorStakeV1
    expect(txn.type).toBe('transfer_validator_stake_v1')
    expect(txn.time).toBe(1587132741)
    expect(txn.stakeAmount.integerBalance).toBe(1000000000000)
    expect(txn.paymentAmount.integerBalance).toBe(100000)
    expect(txn.fee.integerBalance).toBe(35000)
  })
})

describe('PaymentV2', () => {
  it('exposes balances for currency fields', () => {
    const json = {
      type: 'payment_v2',
      time: 1587132741,
      signature: 'RSXR9pkn9ZnkZOZ',
      payments: [
        {
          payee: '13DKymsEaCSpNTithKUbyn7zDEYV3xfoAsA2iFM6bsw8YtPaoCZ',
          amount: 50,
          memo: 'memo',
          token_type: 'hnt',
        },
        {
          payee: '13DKymsEaCSpNTithKUbyn7zDEYV3xfoAsA2iFM6bsw8YtPaoCZ',
          amount: 50,
          memo: 'memo',
          token_type: 'hnt',
        },
        {
          payee: '13DKymsEaCSpNTithKUbyn7zDEYV3xfoAsA2iFM6bsw8YtPaoCZ',
          amount: 50,
          memo: 'memo',
          token_type: 'mobile',
        },
        {
          payee: '13DKymsEaCSpNTithKUbyn7zDEYV3xfoAsA2iFM6bsw8YtPaoCZ',
          amount: 50,
          memo: 'memo',
          token_type: 'iot',
        },
      ],
      payer: '13sSQT9ZAvcDm7U6GizvUWZbHyT24NpNUdkeq8io7XJ9sggf4Yu',
      nonce: 1,
      height: 295781,
      hash: 'EZN6c6pZZZxii8vnGN10KxC-O3YvaEXTSEifl0ckUyQ',
      fee: 3,
    }
    const jsonWithoutTokenType = {
      type: 'payment_v2',
      time: 1587132741,
      signature: 'RSXR9pkn9ZnkZOZ',
      payments: [
        {
          payee: '13DKymsEaCSpNTithKUbyn7zDEYV3xfoAsA2iFM6bsw8YtPaoCZ',
          amount: 50,
          memo: 'memo',
          max: false,
        },
      ],
      payer: '13sSQT9ZAvcDm7U6GizvUWZbHyT24NpNUdkeq8io7XJ9sggf4Yu',
      nonce: 1,
      height: 295781,
      hash: 'EZN6c6pZZZxii8vnGN10KxC-O3YvaEXTSEifl0ckUyQ',
      fee: 3,
    }
    const txn = Transaction.fromJsonObject(json) as PaymentV2
    expect(txn.totalAmountHnt.integerBalance).toBe(100)
    expect(txn.totalAmountMobile.integerBalance).toBe(50)
    expect(txn.totalAmountIot.integerBalance).toBe(50)
    expect(txn.fee.integerBalance).toBe(3)
    expect(txn.data.hash).toBe(txn.hash)
    expect(txn.payments[0].payee).toBe('13DKymsEaCSpNTithKUbyn7zDEYV3xfoAsA2iFM6bsw8YtPaoCZ')
    expect(txn.payments[0].amount.integerBalance).toBe(50)
    expect(txn.payments[0].amount.type.ticker).toBe('HNT')
    expect(txn.payments[0].memo).toBe('memo')
    expect(txn.payments[0].max).toBeFalsy()

    const txnWithoutTokenType = Transaction.fromJsonObject(jsonWithoutTokenType) as PaymentV2
    expect(txnWithoutTokenType.totalAmountHnt.integerBalance).toBe(50)
    expect(txnWithoutTokenType.totalAmountMobile.integerBalance).toBe(0)
    expect(txnWithoutTokenType.totalAmountIot.integerBalance).toBe(0)
    expect(txnWithoutTokenType.fee.integerBalance).toBe(3)
    expect(txnWithoutTokenType.data.hash).toBe(txn.hash)
    expect(txnWithoutTokenType.payments[0].payee).toBe('13DKymsEaCSpNTithKUbyn7zDEYV3xfoAsA2iFM6bsw8YtPaoCZ')
    expect(txnWithoutTokenType.payments[0].amount.integerBalance).toBe(50)
    expect(txnWithoutTokenType.payments[0].memo).toBe('memo')
  })

  it('exposes max for currency fields', () => {
    const json = {
      type: 'payment_v2',
      time: 1587132741,
      signature: 'RSXR9pkn9ZnkZOZ',
      payments: [
        {
          payee: '13DKymsEaCSpNTithKUbyn7zDEYV3xfoAsA2iFM6bsw8YtPaoCZ',
          amount: 0,
          memo: 'memo',
          max: true,
        },
      ],
      payer: '13sSQT9ZAvcDm7U6GizvUWZbHyT24NpNUdkeq8io7XJ9sggf4Yu',
      nonce: 1,
      height: 295781,
      hash: 'EZN6c6pZZZxii8vnGN10KxC-O3YvaEXTSEifl0ckUyQ',
      fee: 3,
    }
    const txn = Transaction.fromJsonObject(json) as PaymentV2
    expect(txn.totalAmountHnt.integerBalance).toBe(0)
    expect(txn.payments[0].max).toBeTruthy()
  })
})

describe('RewardsV1', () => {
  it('exposes a totalAmount balance', () => {
    const json = {
      type: 'rewards_v1',
      time: 1587424041,
      start_epoch: 300165,
      rewards: [
        {
          type: 'poc_witnesses',
          gateway: 'fake-gateway-address',
          amount: 2000,
          account: 'fake-owner-address',
        },
        {
          type: 'poc_witnesses',
          gateway: 'fake-gateway-address',
          amount: 1000,
          account: 'fake-owner-address',
        },
      ],
      height: 123456,
      hash: 'fake-txn-hash',
      end_epoch: 300195,
    }
    const txn = Transaction.fromJsonObject(json) as RewardsV1
    expect(txn.totalAmount.integerBalance).toBe(3000)
    expect(txn.data.hash).toBe(txn.hash)
  })
})

describe('RewardsV2', () => {
  it('exposes a totalAmount balance', () => {
    const json = {
      type: 'rewards_v2',
      time: 1587424041,
      start_epoch: 300165,
      rewards: [
        {
          type: 'poc_witnesses',
          gateway: 'fake-gateway-address',
          amount: 2000,
          account: 'fake-owner-address',
        },
        {
          type: 'poc_witnesses',
          gateway: 'fake-gateway-address',
          amount: 1000,
          account: 'fake-owner-address',
        },
      ],
      height: 123456,
      hash: 'fake-txn-hash',
      end_epoch: 300195,
    }
    const txn = Transaction.fromJsonObject(json) as RewardsV2
    expect(txn.totalAmount.integerBalance).toBe(3000)
    expect(txn.data.hash).toBe(txn.hash)
  })
})

describe('TransferHotspotV1', () => {
  it('exposes balances for currency fields', () => {
    const json = {
      type: 'transfer_hotspot_v1',
      time: 1607559551,
      seller: '133yVfiCKZKTxHgWY6UQ8uD6CX2j9q5e2BNjZGCdmcUMLSMubn5',
      height: 625011,
      hash: 'rHkOU-wR2JpsN5zL5Pr46MFGpUuFiMleZPu1NRiyq1c',
      gateway: '112AMbwEAp4QyZeBQYuTMt8wa5W6ceK1xNjG59duxqB6Dx7fS1c4',
      fee: 55000,
      buyer_nonce: 2,
      buyer: '13U1qigMC832L2oJLYqEYEdBH1JBMNqbRYZ6RuduNr6ntsKP7om',
      amount_to_seller: 500000000,
    }
    const txn = Transaction.fromJsonObject(json) as TransferHotspotV1
    expect(txn.amountToSeller.integerBalance).toBe(500000000)
    expect(txn.fee.integerBalance).toBe(55000)
    expect(txn.data.hash).toBe(txn.hash)
  })
})

describe('TransferHotspotV2', () => {
  it('correctly converts transfer_hotspot_v2', () => {
    const json = {
      type: 'transfer_hotspot_v2',
      time: 1607559551,
      gateway: '112AMbwEAp4QyZeBQYuTMt8wa5W6ceK1xNjG59duxqB6Dx7fS1c4',
      owner: '133yVfiCKZKTxHgWY6UQ8uD6CX2j9q5e2BNjZGCdmcUMLSMubn5',
      owner_signature:
        'AP0mjpyq3Z4Fa7v_XJn9ezvFgJdbkuL6JNXxQejdVPNNR5BGPn6Aai4CZ7_343rn2ykluEKq1Y714Q9DB72OCA',
      new_owner: '13U1qigMC832L2oJLYqEYEdBH1JBMNqbRYZ6RuduNr6ntsKP7om',
      height: 625011,
      hash: 'rHkOU-wR2JpsN5zL5Pr46MFGpUuFiMleZPu1NRiyq1c',
      fee: 55000,
      nonce: 2,
    }
    const txn = Transaction.fromJsonObject(json) as TransferHotspotV2
    expect(txn.gateway).toBe(json.gateway)
    expect(txn.owner).toBe(json.owner)
    expect(txn.ownerSignature).toBe(json.owner_signature)
    expect(txn.newOwner).toBe(json.new_owner)
    expect(txn.nonce).toBe(json.nonce)
    expect(txn.fee.integerBalance).toBe(55000)
    expect(txn.data.hash).toBe(txn.hash)
  })
})

describe('SecurityExchangeV1', () => {
  it('correctly converts security_exchange_v1', () => {
    const json = {
      type: 'security_exchange_v1',
      time: 1607559551,
      payer: '133yVfiCKZKTxHgWY6UQ8uD6CX2j9q5e2BNjZGCdmcUMLSMubn5',
      payee: '13U1qigMC832L2oJLYqEYEdBH1JBMNqbRYZ6RuduNr6ntsKP7om',
      nonce: 30,
      height: 625011,
      hash: 'rHkOU-wR2JpsN5zL5Pr46MFGpUuFiMleZPu1NRiyq1c',
      fee: 35000,
      amount: 1814000000,
    }
    const txn = Transaction.fromJsonObject(json) as SecurityExchangeV1
    expect(txn.type).toBe(json.type)
    expect(txn.time).toBe(json.time)
    expect(txn.payer).toBe(json.payer)
    expect(txn.payee).toBe(json.payee)
    expect(txn.nonce).toBe(json.nonce)
    expect(txn.fee.integerBalance).toBe(35000)
    expect(txn.amount.integerBalance).toBe(1814000000)
    expect(txn.amount.floatBalance).toBe(18.14)
  })
})

describe('PocReceiptsV1', () => {
  it('correctly converts poc_receipts_v1', () => {
    const txn = Transaction.fromJsonObject(
      challengeJson([
        {
          witnesses: [mockWitness()] as HTTPWitnessesObject[],
          receipt: mockReceipt,
          geocode: mockGeocode,
          ...mockPathData,
        } as HTTPPathObject,
      ] as HTTPPathObject[]),
    ) as PocReceiptsV1
    expect(txn.challenger).toBe('fake-challenger')
    expect(txn.data.hash).toBe(txn.hash)
  })
})

describe('PocReceiptsV2', () => {
  it('correctly converts poc_receipts_v2', () => {
    const txn = Transaction.fromJsonObject(
      challengeJson(
        [
          {
            witnesses: [mockWitness()] as HTTPWitnessesObject[],
            receipt: mockReceipt,
            geocode: mockGeocode,
            ...mockPathData,
          } as HTTPPathObject,
        ] as HTTPPathObject[],
        true,
      ),
    ) as PocReceiptsV2
    expect(txn.challenger).toBe('fake-challenger')
    expect(txn.data.hash).toBe(txn.hash)
  })
})

describe('SubnetworkRewardsV1', () => {
  it('correctly converts mobile token json', () => {
    const json = {
      type: 'subnetwork_rewards_v1',
      token_type: 'mobile',
      time: 1587424041,
      start_epoch: 300165,
      rewards: [
        {
          amount: 2000,
          account: 'fake-owner-address',
        },
        {
          amount: 1000,
          account: 'fake-owner-address',
        },
      ],
      height: 123456,
      hash: 'fake-txn-hash',
      end_epoch: 300195,
    }
    const txn = Transaction.fromJsonObject(json) as SubnetworkRewardsV1
    expect(txn.tokenType).toBe('mobile')
    expect(txn.rewards.length).toBe(2)
    expect(txn.rewards[0].amount.floatBalance).toBe(0.00002)
    expect(txn.rewards[0].amount.type.ticker).toBe('MOBILE')
  })

  it('correctly converts iot token json', () => {
    const json = {
      type: 'subnetwork_rewards_v1',
      token_type: 'iot',
      time: 1587424041,
      start_epoch: 300165,
      rewards: [
        {
          amount: 2000,
          account: 'fake-owner-address',
        },
        {
          amount: 1000,
          account: 'fake-owner-address',
        },
      ],
      height: 123456,
      hash: 'fake-txn-hash',
      end_epoch: 300195,
    }
    const txn = Transaction.fromJsonObject(json) as SubnetworkRewardsV1
    expect(txn.tokenType).toBe('iot')
    expect(txn.rewards.length).toBe(2)
    expect(txn.rewards[0].amount.floatBalance).toBe(0.00002)
    expect(txn.rewards[0].amount.type.ticker).toBe('IOT')
  })
})

describe('TokenRedeemV1', () => {
  it('correctly converts hnt to mobile txn json', () => {
    const json = {
      type: 'token_redeem_v1',
      account: 'fake-owner-address',
      amount: 2000,
      token_type: 'mobile',
      nonce: 1,
      time: 1587424041,
      height: 123456,
      hash: 'fake-txn-hash',
    }
    const txn = Transaction.fromJsonObject(json) as TokenRedeemV1
    expect(txn.amount.type.ticker).toBe('MOBILE')
    expect(txn.tokenType).toBe('mobile')
  })

  it('correctly converts hnt to iot txn json', () => {
    const json = {
      type: 'token_redeem_v1',
      account: 'fake-owner-address',
      amount: 2000,
      token_type: 'iot',
      nonce: 1,
      time: 1587424041,
      height: 123456,
      hash: 'fake-txn-hash',
    }
    const txn = Transaction.fromJsonObject(json) as TokenRedeemV1
    expect(txn.amount.type.ticker).toBe('IOT')
    expect(txn.tokenType).toBe('iot')
  })
})
