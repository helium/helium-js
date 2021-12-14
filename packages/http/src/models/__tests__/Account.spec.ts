import { CurrencyType } from '@helium/currency'
import { NetType } from '@helium/crypto'
import Account from '../Account'
import Client from '../../Client'

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
      address: '132M1aKpkzcKiX9rP8bULxZb3uzdiTKtWvvzk9dUYLqDXLNTgp4',
    })

    expect(account.balance?.integerBalance).toBe(1)
    expect(account.balance?.type?.ticker).toBe(CurrencyType.networkToken.ticker)
    expect(account.netType).toBe(NetType.MAINNET)
    expect(account.secBalance?.integerBalance).toBe(1)
    expect(account.dcBalance?.integerBalance).toBe(1)
    expect(account.stakedBalance?.integerBalance).toBe(100)
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
      address: '1a7UT3iazovwb5yDUHgFzGSaQpgKuoMMtvBZZfiCV8xa7GwiyC5',
    })

    expect(account.balance?.integerBalance).toBe(1)
    expect(account.balance?.type?.ticker).toBe(CurrencyType.testNetworkToken.ticker)
    expect(account.netType).toBe(NetType.TESTNET)
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
      address: '132M1aKpkzcKiX9rP8bULxZb3uzdiTKtWvvzk9dUYLqDXLNTgp4',
    })

    expect(account.balance?.integerBalance).toBe(0)
    expect(account.secBalance?.integerBalance).toBe(0)
    expect(account.dcBalance?.integerBalance).toBe(0)
  })
})
