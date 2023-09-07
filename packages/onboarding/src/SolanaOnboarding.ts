import { Connection, PublicKey } from '@solana/web3.js'
import getSolanaAssertData, {
  AssertData,
  DcProgram,
  HemProgram,
  TXN_FEE_IN_LAMPORTS,
} from './getAssertData'
import OnboardingClient from './OnboardingClient'
import { AnchorProvider } from '@coral-xyz/anchor'
import { HNT_MINT, heliumAddressToSolPublicKey, sendAndConfirmWithRetry } from '@helium/spl-utils'
import { init as initDc } from '@helium/data-credits-sdk'
import { init as initHem, keyToAssetKey } from '@helium/helium-entity-manager-sdk'
import Balance, { CurrencyType } from '@helium/currency'
import { HotspotType } from './types'
import { daoKey } from '@helium/helium-sub-daos-sdk'

const DEFAULT_TIMEOUT = 1 * 60 * 1000 // 1 minute
export default class SolanaOnboarding {
  private shouldMock: boolean
  private connection!: Connection
  private hemProgram?: HemProgram
  private dcProgram?: DcProgram
  private wallet!: PublicKey
  private onboardingClient!: OnboardingClient
  private provider!: AnchorProvider

  constructor({
    shouldMock,
    onboardingClient,
    heliumWalletAddress,
    connection,
  }: {
    shouldMock?: boolean
    onboardingClient: OnboardingClient
    heliumWalletAddress: string
    connection: Connection
  }) {
    this.shouldMock = !!shouldMock
    this.onboardingClient = onboardingClient
    this.connection = connection

    const solanaPubKey = heliumAddressToSolPublicKey(heliumWalletAddress)
    this.wallet = solanaPubKey

    this.provider = new AnchorProvider(
      connection,
      // @ts-ignore
      {
        get publicKey() {
          return solanaPubKey
        },
      },
      {
        preflightCommitment: 'confirmed',
      },
    )
  }

  private getHemProgram = async (): Promise<HemProgram> => {
    if (!this.hemProgram) {
      this.hemProgram = await initHem(this.provider)
    }
    return this.hemProgram!
  }

  private getDcProgram = async (): Promise<DcProgram> => {
    if (!this.dcProgram) {
      this.dcProgram = await initDc(this.provider)
    }
    return this.dcProgram!
  }

  getAssertData = async ({
    gateway,
    decimalGain,
    elevation,
    location,
    hotspotTypes,
    maker,
  }: {
    gateway: string
    decimalGain?: number
    elevation?: number
    location: string
    maker: PublicKey
    hotspotTypes: HotspotType[]
  }): Promise<AssertData> => {
    if (this.shouldMock) {
      return {
        balances: {
          hnt: Balance.fromFloat(1000, CurrencyType.networkToken),
          dc: Balance.fromFloat(1000, CurrencyType.dataCredit),
          sol: Balance.fromFloat(1000, CurrencyType.solTokens),
          mobile: Balance.fromFloat(1000, CurrencyType.mobile),
        },
        isFree: false,
        makerFees: {
          sol: new Balance(TXN_FEE_IN_LAMPORTS, CurrencyType.solTokens),
          dc: new Balance(1000000, CurrencyType.dataCredit),
        },
        ownerFees: {
          sol: new Balance(0, CurrencyType.solTokens),
          dc: new Balance(0, CurrencyType.dataCredit),
        },
        solanaTransactions: [],
        hasSufficientBalance: true,
        hasSufficientDc: true,
        hasSufficientHnt: true,
        hasSufficientSol: true,
        dcNeeded: Balance.fromFloat(0, CurrencyType.dataCredit),
        oraclePrice: Balance.fromFloat(2, CurrencyType.usd),
      }
    }

    const dcProgram = await this.getDcProgram()
    const hemProgram = await this.getHemProgram()

    return getSolanaAssertData({
      onboardingClient: this.onboardingClient,
      connection: this.connection,
      owner: this.wallet,
      dcProgram,
      hemProgram,
      decimalGain,
      gateway,
      elevation,
      maker,
      nextLocation: location,
      hotspotTypes,
    })
  }

  keyToAsset = async (hotspotAddress: string) => {
    if (!this.shouldMock) {
      const [dao] = daoKey(HNT_MINT)
      const [keyToAssetK] = keyToAssetKey(dao, hotspotAddress)
      const keyToAssetAcc = await this.hemProgram?.account.keyToAssetV0.fetchNullable(keyToAssetK)

      return keyToAssetAcc?.asset
    }

    return PublicKey.default
  }

  submit = async ({
    txn,
    timeout,
    skipPreflight,
  }: {
    txn: Buffer
    timeout?: number
    skipPreflight?: boolean
  }) => {
    if (this.shouldMock) {
      return 'some-txn-id'
    }

    const { txid } = await sendAndConfirmWithRetry(
      this.connection,
      txn,
      { skipPreflight: skipPreflight || true },
      'confirmed',
      timeout || DEFAULT_TIMEOUT,
    )
    return txid
  }

  submitAll = async ({
    txns,
    timeout,
    skipPreflight,
  }: {
    txns: Buffer[]
    timeout?: number
    skipPreflight?: boolean
  }) => {
    const results = [] as string[]
    for (const txn of txns) {
      results.push(await this.submit({ txn, timeout, skipPreflight }))
    }
    return results
  }
}
