import { Cluster, Connection, PublicKey } from '@solana/web3.js'
import * as HotspotOnboardingUtil from './HotspotOnboardingUtil'
import OnboardingClient from './OnboardingClient'
import { AnchorProvider } from '@coral-xyz/anchor'
import {
  HNT_MINT,
  sendAndConfirmWithRetry,
  getAsset,
  bulkSendRawTransactions,
} from '@helium/spl-utils'
import { init as initDc } from '@helium/data-credits-sdk'
import { init as initHem, keyToAssetKey } from '@helium/helium-entity-manager-sdk'
import { AssertData, DcProgram, HemProgram, NetworkType, SubmitStatus } from './types'
import { daoKey } from '@helium/helium-sub-daos-sdk'
import * as AssertMock from './__mocks__/AssertMock'
import {
  createTransferInstructions,
  createTransferCompressedCollectableTxn,
} from '@helium/hotspot-utils'

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

  getUpdateMetaData = async ({
    gateway,
    decimalGain,
    azimuth,
    antenna,
    elevation,
    location,
    networkType,
    serial,
    format,
  }: {
    gateway: string
    azimuth?: number
    decimalGain?: number
    antenna?: number
    elevation?: number
    location: string
    networkType: NetworkType
    serial?: string
    format?: 'legacy' | 'v0'
  }): Promise<AssertData> => {
    if (this.shouldMock) {
      return AssertMock.getAssertData()
    }

    const dcProgram = await this.getDcProgram()
    const hemProgram = await this.getHemProgram()

    return HotspotOnboardingUtil.getUpdateMetaData({
      onboardingClient: this.onboardingClient,
      connection: this.connection,
      owner: this.wallet,
      dcProgram,
      hemProgram,
      decimalGain,
      gateway,
      antenna,
      azimuth,
      elevation,
      nextLocation: location,
      networkType,
      cluster: this.cluster,
      serial,
      format,
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
    skipPreflight,
    onProgress,
    lastValidBlockHeight,
  }: {
    txns: Buffer[]
    onProgress?: ((status: SubmitStatus) => void) | undefined
    lastValidBlockHeight?: number | undefined
    skipPreflight?: boolean
  }) => {
    if (this.shouldMock) {
      return [AssertMock.submit()]
    }

    return bulkSendRawTransactions(
      this.connection,
      txns,
      onProgress,
      lastValidBlockHeight,
      skipPreflight,
    )
  }

  getHotspotDetails = async ({
    networkType,
    address,
  }: {
    address: string
    networkType: NetworkType
  }) => {
    if (this.shouldMock) {
      return {
        elevation: 1,
        gain: 1,
        location: '8c28d55251b55ff',
        isFullHotspot: true,
        numLocationAsserts: 1,
      }
    }

    const hemProgram = await this.getHemProgram()
    return HotspotOnboardingUtil.getHotspotNetworkDetails({ networkType, address, hemProgram })
  }

  createTransferCompressedCollectableTxn = async ({
    newOwner,
    hotspotAddress,
  }: {
    newOwner: string
    hotspotAddress: string
  }) => {
    const hotspotPubKey = await this.hotspotToAssetKey(hotspotAddress)
    if (!hotspotPubKey) throw new Error('Hotspot key not found')

    const rpcEndpoint = this.connection.rpcEndpoint

    const asset = await getAsset(rpcEndpoint, hotspotPubKey)

    if (!asset) {
      throw new Error('Hotspot not found')
    }

    return createTransferCompressedCollectableTxn({
      collectable: asset,
      owner: this.wallet,
      recipient: new PublicKey(newOwner),
      connection: this.connection,
      url: rpcEndpoint,
    })
  }

  createTransferInstructions = async ({
    newOwner,
    hotspotAddress,
  }: {
    newOwner: string
    hotspotAddress: string
  }) => {
    const hotspotPubKey = await this.hotspotToAssetKey(hotspotAddress)
    if (!hotspotPubKey) throw new Error('Hotspot key not found')

    const rpcEndpoint = this.connection.rpcEndpoint

    const asset = await getAsset(rpcEndpoint, hotspotPubKey)

    if (!asset) {
      throw new Error('Hotspot not found')
    }

    return createTransferInstructions({
      collectable: asset,
      owner: this.wallet,
      recipient: new PublicKey(newOwner),
      connection: this.connection,
      url: rpcEndpoint,
    })
  }
}
