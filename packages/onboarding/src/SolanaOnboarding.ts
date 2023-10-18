import { Cluster, Connection, PublicKey } from '@solana/web3.js'
import * as AssertUtil from './AssertUtil'
import OnboardingClient from './OnboardingClient'
import { AnchorProvider, BN } from '@coral-xyz/anchor'
import { HNT_MINT, sendAndConfirmWithRetry, IOT_MINT, MOBILE_MINT } from '@helium/spl-utils'
import { init as initDc } from '@helium/data-credits-sdk'
import {
  init as initHem,
  iotInfoKey,
  keyToAssetKey,
  mobileInfoKey,
  rewardableEntityConfigKey,
} from '@helium/helium-entity-manager-sdk'
import { AssertData, DcProgram, HemProgram, HotspotType } from './types'
import { daoKey, subDaoKey } from '@helium/helium-sub-daos-sdk'
import * as AssertMock from './__mocks__/AssertMock'

const DEFAULT_TIMEOUT = 1 * 60 * 1000 // 1 minute
export default class SolanaOnboarding {
  private shouldMock: boolean
  private connection!: Connection
  private cluster!: Cluster
  private hemProgram?: HemProgram
  private dcProgram?: DcProgram
  private wallet!: PublicKey
  private onboardingClient!: OnboardingClient
  private provider!: AnchorProvider

  constructor({
    shouldMock,
    onboardingClient,
    wallet,
    connection,
    cluster,
  }: {
    shouldMock?: boolean
    onboardingClient: OnboardingClient
    wallet: PublicKey
    connection: Connection
    cluster: Cluster
  }) {
    this.shouldMock = !!shouldMock
    this.onboardingClient = onboardingClient
    this.connection = connection
    this.cluster = cluster

    this.wallet = wallet

    this.provider = new AnchorProvider(
      connection,
      // @ts-ignore
      {
        get publicKey() {
          return wallet
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
    maker?: PublicKey
    hotspotTypes: HotspotType[]
  }): Promise<AssertData> => {
    if (this.shouldMock) {
      return AssertMock.getAssertData()
    }

    const dcProgram = await this.getDcProgram()
    const hemProgram = await this.getHemProgram()

    return AssertUtil.getAssertData({
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
      cluster: this.cluster,
    })
  }

  hotspotToAssetKey = async (hotspotAddress: string) => {
    const hemProgram = await this.getHemProgram()
    if (this.shouldMock) {
      return AssertMock.hotspotToAssetKey()
    }

    const [dao] = daoKey(HNT_MINT)
    const [keyToAssetK] = keyToAssetKey(dao, hotspotAddress)
    const keyToAssetAcc = await hemProgram.account.keyToAssetV0.fetchNullable(keyToAssetK)
    return keyToAssetAcc?.asset
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
      return AssertMock.submit()
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

  hotspotInfoToDetails = (value: {
    asset: PublicKey
    bumpSeed: number
    isFullHotspot?: boolean
    location: BN | null
    numLocationAsserts?: number
    elevation: number | null
    gain: number | null
  }) => {
    const location = value.location?.toString('hex')
    return {
      elevation: value.elevation || undefined,
      gain: value.gain || undefined,
      location,
      isFullHotspot: value.isFullHotspot,
      numLocationAsserts: value.numLocationAsserts,
    }
  }

  getHotspotDetails = async ({ type, address }: { address: string; type: 'MOBILE' | 'IOT' }) => {
    if (this.shouldMock) {
      return {
        elevation: 1,
        gain: 1,
        location: '8c28d55251b55ff',
        isFullHotspot: true,
        numLocationAsserts: 1,
      }
    }

    try {
      const hemProgram = await this.getHemProgram()

      const mint = type === 'IOT' ? IOT_MINT : MOBILE_MINT
      const subDao = subDaoKey(mint)[0]

      const configKey = rewardableEntityConfigKey(subDao, type)

      const entityConfig = await hemProgram.account.rewardableEntityConfigV0.fetchNullable(
        configKey[0],
      )
      if (!entityConfig) return

      if (type === 'IOT') {
        const [info] = iotInfoKey(configKey[0], address)
        const iotInfo = await hemProgram.account.iotHotspotInfoV0.fetch(info)
        return this.hotspotInfoToDetails(iotInfo)
      }

      const [info] = mobileInfoKey(configKey[0], address)
      const mobileInfo = await hemProgram.account.mobileHotspotInfoV0.fetch(info)
      return this.hotspotInfoToDetails(mobileInfo)
    } catch (e) {
      const error = String(e)
      if (error.startsWith('Error: Account does not exist or has no data')) {
        // This is an expected error. It has not been onboarded to this network
        return
      }

      throw e
    }
  }
}
