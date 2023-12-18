import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import { AssertData } from '../types'

export const getAssertData = async (): Promise<AssertData> => {
  return {
    balances: {
      hnt: new BN(100000000000),
      dc: new BN(1000000000),
      sol: new BN(1000000000000),
    },
    isFree: false,
    solanaTransactions: [],
    hasSufficientBalance: true,
    hasSufficientDc: true,
    hasSufficientHnt: true,
    hasSufficientSol: true,
    dcNeeded: new BN(0),
  }
}

export const submit = () => 'some-txn-id'

export const hotspotToAssetKey = () => PublicKey.default
