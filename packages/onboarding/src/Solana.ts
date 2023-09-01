import { Connection, PublicKey } from '@solana/web3.js'
import getSolanaAssertData, {
  AssertData,
  DcProgram,
  HemProgram,
  TXN_FEE_IN_LAMPORTS,
} from './getAssertData'
import OnboardingClient, { HotspotType } from '@helium/onboarding'
import { AnchorProvider } from '@coral-xyz/anchor'
import { heliumAddressToSolPublicKey } from '@helium/spl-utils'
import { init as initDc } from '@helium/data-credits-sdk'
import { init as initHem } from '@helium/helium-entity-manager-sdk'
import Balance, { CurrencyType } from '@helium/currency'

export default class Solana {
  private shouldMock: boolean
  private connection!: Connection
  private hemProgram?: HemProgram
  private dcProgram?: DcProgram
  private wallet!: PublicKey
  private makerWallet!: PublicKey
  private onboardingClient!: OnboardingClient
  private provider!: AnchorProvider

  constructor({
    shouldMock,
    onboardingClient,
    heliumWalletAddress,
    makerHeliumWalletAddress,
    connection,
  }: {
    shouldMock?: boolean
    onboardingClient: OnboardingClient
    heliumWalletAddress: string
    makerHeliumWalletAddress: string
    connection: Connection
  }) {
    this.shouldMock = !!shouldMock
    this.onboardingClient = onboardingClient
    this.connection = connection

    const solanaPubKey = heliumAddressToSolPublicKey(heliumWalletAddress)
    this.wallet = solanaPubKey

    const payerSolanaPubKey = heliumAddressToSolPublicKey(makerHeliumWalletAddress)
    this.makerWallet = payerSolanaPubKey

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

  getHemProgram = async () => {
    if (!this.hemProgram) {
      this.hemProgram = await initHem(this.provider)
    }
    return this.hemProgram!
  }

  getDcProgram = async () => {
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
  }: {
    gateway: string
    decimalGain?: number
    elevation?: number
    location: string
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
      maker: this.makerWallet,
      nextLocation: location,
      hotspotTypes,
    })
  }
}
