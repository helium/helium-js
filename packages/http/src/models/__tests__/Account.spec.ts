import { CurrencyType } from '@helium/currency'
import { NetTypes } from '@helium/address'
import Account from '../Account'
import Client from '../../Client'

const ECC_COMPACT_ADDRESS = '112qB3YaH5bZkCnKA5uRH7tBtGNv2Y5B4smv1jsmvGUzgKT71QpE'
const TESTNET_ADDRESS = '1bijtibPhc16wx4oJbyK8vtkAgdoRoaUvJeo7rXBnBCufEYakfd'

describe('balances', () => {
  it('returns a Balance', () => {
    const client = new Client()
    const account = new Account(client, {
      speculative_nonce: 1,
      staked_balance: 100,
      sec_nonce: 1,
      sec_balance: 1,
      nonce: 1,
      dc_balance: 1,
      dc_nonce: 1,
      block: 1,
      balance: 1,
      address: ECC_COMPACT_ADDRESS,
      hotspot_count: 650,
      validator_count: 10,
    })

    expect(account.balance?.integerBalance).toBe(1)
    expect(account.balance?.type?.ticker).toBe(CurrencyType.networkToken.ticker)
    expect(account.netType).toBe(NetTypes.MAINNET)
    expect(account.secBalance?.integerBalance).toBe(1)
    expect(account.dcBalance?.integerBalance).toBe(1)
    expect(account.stakedBalance?.integerBalance).toBe(100)
    expect(account.hotspotCount).toBe(650)
    expect(account.validatorCount).toBe(10)
  })

  it('returns a testnet Balance', () => {
    const client = new Client()
    const account = new Account(client, {
      speculative_nonce: 1,
      staked_balance: 100,
      sec_nonce: 1,
      sec_balance: 1,
      nonce: 1,
      dc_balance: 1,
      dc_nonce: 1,
      block: 1,
      balance: 1,
      address: TESTNET_ADDRESS,
    })

    expect(account.balance?.integerBalance).toBe(1)
    expect(account.balance?.type?.ticker).toBe(CurrencyType.testNetworkToken.ticker)
    expect(account.netType).toBe(NetTypes.TESTNET)
    expect(account.secBalance?.integerBalance).toBe(1)
    expect(account.dcBalance?.integerBalance).toBe(1)
    expect(account.stakedBalance?.integerBalance).toBe(100)
  })

  it('still returns a balance even if it is 0', () => {
    const client = new Client()
    const account = new Account(client, {
      speculative_nonce: 1,
      staked_balance: 100,
      sec_nonce: 1,
      sec_balance: 0,
      nonce: 1,
      dc_balance: 0,
      dc_nonce: 1,
      block: 1,
      balance: 0,
      address: ECC_COMPACT_ADDRESS,
    })

    expect(account.balance?.integerBalance).toBe(0)
    expect(account.secBalance?.integerBalance).toBe(0)
    expect(account.dcBalance?.integerBalance).toBe(0)
  })
})
