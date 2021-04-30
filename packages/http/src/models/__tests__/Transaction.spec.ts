import Transaction, { PaymentV2, PocReceiptsV1, RewardsV1, RewardsV2, TransferHotspotV1 } from '../Transaction'
import { HTTPPathObject, HTTPWitnessesObject } from '../Challenge'
import {
  challengeJson,
  mockGeocode,
  mockPathData,
  mockReceipt,
  mockWitness,
} from './Challenge.spec'

describe('PaymentV2', () => {
  it('exposes balances for currency fields', () => {
    const json = {
      type: 'payment_v2',
      time: 1587132741,
      signature: 'RSXR9pkn9ZnkZOZ',
      payments: [
        {
          payee: '13DKymsEaCSpNTithKUbyn7zDEYV3xfoAsA2iFM6bsw8YtPaoCZ',
          amount: 75,
          memo: 'memo',
        },
      ],
      payer: '13sSQT9ZAvcDm7U6GizvUWZbHyT24NpNUdkeq8io7XJ9sggf4Yu',
      nonce: 1,
      height: 295781,
      hash: 'EZN6c6pZZZxii8vnGN10KxC-O3YvaEXTSEifl0ckUyQ',
      fee: 3,
    }
    const txn = Transaction.fromJsonObject(json) as PaymentV2
    expect(txn.totalAmount.integerBalance).toBe(75)
    expect(txn.fee.integerBalance).toBe(3)
    expect(txn.payments[0].payee).toBe('13DKymsEaCSpNTithKUbyn7zDEYV3xfoAsA2iFM6bsw8YtPaoCZ')
    expect(txn.payments[0].amount).toBe(75)
    expect(txn.payments[0].memo).toBe('memo')
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
  })
})
