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
      address: 'some-address',
    })

    expect(account.balance?.integerBalance).toBe(1)
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
      address: 'some-address',
    })

    expect(account.balance?.integerBalance).toBe(0)
    expect(account.secBalance?.integerBalance).toBe(0)
    expect(account.dcBalance?.integerBalance).toBe(0)
  })
})
