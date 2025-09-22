import OnboardingClient, { OnboardingResponse } from './OnboardingClient'
import BN from 'bn.js'
import {
  DC_MINT,
  IOT_MINT,
  MOBILE_MINT,
  HNT_MINT,
  heliumAddressToSolPublicKey,
} from '@helium/spl-utils'
import { subDaoKey } from '@helium/helium-sub-daos-sdk'
import { Connection, PublicKey, Cluster } from '@solana/web3.js'
import {
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token'
import {
  iotInfoKey,
  mobileInfoKey,
  rewardableEntityConfigKey,
} from '@helium/helium-entity-manager-sdk'
import * as Currency from '@helium/currency-utils'
import { HNT_AS_BONES, DcProgram, HemProgram, Maker, NetworkType } from './types'
import { VersionedTransaction } from '@solana/web3.js'

const lowerFirst = (str: string) => str.charAt(0).toLowerCase() + str.slice(1)

const hotspotInfoToDetails = (value: {
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

export const getHotspotNetworkDetails = async ({
  address,
  hemProgram,
  networkType,
}: {
  address: string
  networkType: NetworkType
  hemProgram: HemProgram
}): Promise<
  | {
      elevation?: number
      gain?: number
      location?: string
      isFullHotspot?: boolean
      numLocationAsserts?: number
      locationStakingFee?: BN
    }
  | undefined
> => {
  const mint = networkType === 'IOT' ? IOT_MINT : MOBILE_MINT
  const subDao = subDaoKey(mint)[0]

  const configKey = rewardableEntityConfigKey(subDao, networkType)

  const entityConfig = await hemProgram.account.rewardableEntityConfigV0.fetchNullable(configKey[0])
  if (!entityConfig) return

  if (networkType === 'IOT') {
    const [info] = iotInfoKey(configKey[0], address)
    const iotInfo = await hemProgram.account.iotHotspotInfoV0.fetchNullable(info)

    // @ts-ignore
    const details = hotspotInfoToDetails(iotInfo)
    const iotConfig = entityConfig.settings.iotConfig
    if (!iotConfig) throw new Error('Could not fetch iot config')

    const locationStakingFee = details.isFullHotspot
      ? iotConfig.fullLocationStakingFee
      : iotConfig.dataonlyLocationStakingFee

    return { ...details, ...iotConfig, locationStakingFee }
  }

  const [info] = mobileInfoKey(configKey[0], address)

  const mobileInfo = await hemProgram.account.mobileHotspotInfoV0.fetchNullable(info)
  if (!mobileInfo) throw new Error('Could not fetch mobile hotspot info')

  const deviceTypeKeys = Object.keys(mobileInfo.deviceType)
  let deviceType = ''
  if (deviceTypeKeys.length) {
    deviceType = deviceTypeKeys[0]
  }

  const mobileConfig =
    entityConfig.settings.mobileConfigV1 ||
    // @ts-ignore - mobileConfigV2 is not in the types yet
    entityConfig.settings.mobileConfigV2
  const deviceFees = mobileConfig?.feesByDevice.find(
    // @ts-ignore
    (fee) => fee.deviceType[lowerFirst(deviceType)] !== undefined,
  )

  // @ts-ignore
  const details = hotspotInfoToDetails(mobileInfo)
  if (!deviceFees) return details
  return {
    ...details,
    locationStakingFee: deviceFees.locationStakingFee,
  }
}

const getOraclePriceInCentsFromSolana = async (opts: {
  connection: Connection
  cluster: Cluster
}) => {
  const price = await Currency.getOraclePrice({ tokenType: 'HNT', ...opts })
  if (!price?.priceMessage.emaPrice) {
    throw new Error('Failed to fetch oracle price')
  }

  return price.priceMessage.emaPrice
}

const getBalance = async (wallet: PublicKey, connection: Connection, mint: PublicKey) => {
  const balance = await Currency.getBalance({
    pubKey: wallet,
    connection,
    mint: new PublicKey(mint),
  })
  return new BN(balance.toString())
}

const getBalances = async (wallet: PublicKey, connection: Connection) => {
  const lamports = await connection.getBalance(wallet)
  const hnt = await getBalance(wallet, connection, HNT_MINT)
  const dc = await getBalance(wallet, connection, DC_MINT)

  return { hnt, dc, lamports: new BN(lamports) }
}

const burnHNTForDataCredits = async ({
  dcAmount,
  wallet,
  connection,
  dcProgram,
}: {
  dcAmount: BN
  wallet: PublicKey
  connection: Connection
  dcProgram: DcProgram
}) => {
  const txn = await dcProgram.methods
    .mintDataCreditsV0({
      hntAmount: null,
      dcAmount,
    })
    .preInstructions([
      createAssociatedTokenAccountIdempotentInstruction(
        wallet,
        getAssociatedTokenAddressSync(DC_MINT, wallet, true),
        wallet,
        DC_MINT,
      ),
    ])
    .accountsPartial({
      dcMint: DC_MINT,
      recipient: wallet,
    })
    .transaction()

  if (!txn) return

  const { blockhash } = await connection.getLatestBlockhash('finalized')
  txn.recentBlockhash = blockhash
  txn.feePayer = wallet

  return txn
}

export const getUpdateMetaData = async ({
  networkType,
  gateway,
  antenna,
  azimuth,
  hemProgram,
  onboardingClient,
  owner,
  connection,
  cluster,
  nextLocation,
  elevation,
  mechanicalDownTilt,
  electricalDownTilt,
  serial,
  decimalGain,
  dcProgram,
}: {
  hemProgram: HemProgram
  connection: Connection
  gateway: string
  owner: PublicKey
  decimalGain?: number
  elevation?: number
  antenna?: number
  azimuth?: number
  mechanicalDownTilt?: number
  electricalDownTilt?: number
  serial?: string
  nextLocation: string
  networkType: NetworkType
  onboardingClient: OnboardingClient
  dcProgram: DcProgram
  cluster: Cluster
}) => {
  const balances = await getBalances(owner, connection)

  const onboardingRecord = await onboardingClient.getOnboardingRecord(gateway)

  let makerKey: PublicKey | undefined
  let maker: Maker | undefined
  if (onboardingRecord.data?.maker.address) {
    maker = onboardingRecord.data?.maker
    makerKey = heliumAddressToSolPublicKey(onboardingRecord.data?.maker.address)
  }

  const solanaAddress = owner.toBase58()

  let solResponse: OnboardingResponse<{
    solanaTransactions: number[][]
  }>

  if (networkType === 'IOT') {
    let gain: number | undefined = undefined
    if (decimalGain) {
      gain = Math.round((decimalGain || 0) * 10.0)
    }

    solResponse = await onboardingClient.updateIotMetadata({
      solanaAddress,
      hotspotAddress: gateway,
      location: nextLocation,
      elevation,
      gain,
    })
  } else {
    solResponse = await onboardingClient.updateMobileMetadata({
      solanaAddress,
      hotspotAddress: gateway,
      location: nextLocation,
      deploymentInfo: {
        wifiInfoV0: {
          elevation: elevation || 0,
          azimuth: azimuth || 0,
          antenna: antenna || 0,
          mechanicalDownTilt: mechanicalDownTilt || 0,
          electricalDownTilt: electricalDownTilt || 0,
          serial,
        },
      },
    })
  }

  const errFound = !solResponse.success ? solResponse : undefined

  if (errFound) {
    throw errFound.errorMessage
  }

  let solanaTransactions = (solResponse.data?.solanaTransactions || []).map((txn) =>
    Buffer.from(txn),
  )

  const networkDetails = await getHotspotNetworkDetails({
    networkType,
    address: gateway,
    hemProgram,
  })

  let makerDc = new BN(0)
  if (makerKey) {
    makerDc = await getBalance(makerKey, connection, DC_MINT)
  }

  const dcFee = networkDetails?.locationStakingFee || new BN(0)
  const insufficientMakerDcBal = makerDc.lt(dcFee)
  const numLocationChanges = networkDetails?.numLocationAsserts || 0
  const isPayer = insufficientMakerDcBal || !maker || numLocationChanges >= maker.locationNonceLimit
  const isFree = !isPayer
  let hasSufficientDc = true
  let hasSufficientSol = true
  let lamportFee = new BN(0)

  if (!isFree) {
    hasSufficientDc = balances.dc.gte(dcFee)
  }

  let dcNeeded: BN | undefined
  let hasSufficientHnt = true
  if (!hasSufficientDc) {
    const dcBalance = balances.dc || new BN(0)
    dcNeeded = dcFee.sub(dcBalance)

    const dcInCents = dcNeeded.div(new BN(100000)).mul(new BN(100))
    const oraclePriceInCents = await getOraclePriceInCentsFromSolana({ connection, cluster })
    const hntNeeded = dcInCents.mul(HNT_AS_BONES).divRound(oraclePriceInCents)
    hasSufficientHnt = balances.hnt.gte(hntNeeded)

    if (hasSufficientHnt) {
      const txn = await burnHNTForDataCredits({
        dcAmount: dcNeeded,
        dcProgram,
        wallet: owner,
        connection,
      })
      if (txn) {
        const serialized = txn.serialize({ verifySignatures: false })
        solanaTransactions = [Buffer.from(serialized), ...solanaTransactions]
      }
    }
  }

  const estimatedFees = await Promise.all(
    solanaTransactions.map(async (buff) => {
      const tx = VersionedTransaction.deserialize(buff)
      const estimatedFee = await connection.getFeeForMessage(tx.message, 'confirmed')
      return estimatedFee.value
    }),
  )
  lamportFee = estimatedFees.reduce((acc, fee) => acc.add(new BN(fee || 0)), new BN(0))

  if (!isFree) {
    hasSufficientSol = balances.lamports.gte(lamportFee)
  }

  const hasSufficientBalance = (hasSufficientDc || hasSufficientHnt) && hasSufficientSol

  return {
    balances,
    hasSufficientBalance,
    hasSufficientSol,
    hasSufficientDc,
    hasSufficientHnt,
    dcFee,
    dcNeeded,
    isFree,
    lamportFee,
    solanaTransactions: solanaTransactions.map((tx) => tx.toString('base64')),
  }
}
