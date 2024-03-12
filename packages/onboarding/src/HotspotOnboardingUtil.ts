import OnboardingClient from './OnboardingClient'
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
  getAccount,
  getMinimumBalanceForRentExemptAccount,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token'
import {
  iotInfoKey,
  mobileInfoKey,
  rewardableEntityConfigKey,
} from '@helium/helium-entity-manager-sdk'
import * as Currency from '@helium/currency-utils'
import {
  BONES_IN_HNT,
  DcProgram,
  DeviceType,
  HemProgram,
  Maker,
  NetworkType,
  TXN_FEE_IN_LAMPORTS,
} from './types'

const lowerFirst = (str: string) => str.charAt(0).toLowerCase() + str.slice(1)

const deviceTypeToNetworkType = (deviceType: DeviceType): NetworkType => {
  // deviceType is null for IOT hotspots
  // cbrs devices are both IOT and MOBILE hotspots, but the location, gain, and elevation are all stored on the IOT side
  if (deviceType === null || deviceType === 'Cbrs') {
    return 'IOT'
  }

  return 'MOBILE'
}

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
  ...opts
}:
  | {
      address: string
      networkType: NetworkType
      hemProgram: HemProgram
    }
  | {
      address: string
      deviceType: DeviceType
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
  const types = { networkType: undefined, deviceType: undefined, ...opts }
  let networkType = types.networkType
  if (!networkType && types.deviceType !== undefined) {
    networkType = deviceTypeToNetworkType(types.deviceType)
  }

  if (!networkType) {
    throw new Error('Could not determine network type')
  }

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
  if (!price?.aggregate.price) {
    throw new Error('Failed to fetch oracle price')
  }

  return new BN(price.aggregate.price * 100)
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
  const bones = await getBalance(wallet, connection, HNT_MINT)
  const dc = await getBalance(wallet, connection, DC_MINT)

  return { bones, dc, lamports: new BN(lamports) }
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
    .accounts({
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

const getAtaAccountCreationFee = async (solanaAddress: PublicKey, connection: Connection) => {
  const ataAddress = getAssociatedTokenAddressSync(DC_MINT, solanaAddress, true)

  try {
    await getAccount(connection, ataAddress)
    return new BN(0)
  } catch {
    const minRent = await getMinimumBalanceForRentExemptAccount(connection)
    return new BN(minRent)
  }
}

export const getAssertData = async ({
  deviceType,
  gateway,
  hemProgram,
  onboardingClient,
  owner,
  connection,
  cluster,
  nextLocation,
  elevation,
  decimalGain,
  dcProgram,
}: {
  hemProgram: HemProgram
  connection: Connection
  gateway: string
  owner: PublicKey
  decimalGain?: number
  elevation?: number
  nextLocation: string
  deviceType: DeviceType
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

  const networkType = deviceTypeToNetworkType(deviceType)
  const solanaAddress = owner.toBase58()
  let gain: number | undefined = undefined
  if (decimalGain) {
    gain = Math.round((decimalGain || 0) * 10.0)
  }

  const solResponse = await onboardingClient.updateMetadata({
    type: networkType,
    solanaAddress,
    hotspotAddress: gateway,
    location: nextLocation,
    elevation,
    gain,
  })

  const errFound = !solResponse.success ? solResponse : undefined

  if (errFound) {
    throw errFound.errorMessage
  }

  let solanaTransactions = (solResponse.data?.solanaTransactions || []).map((txn) =>
    Buffer.from(txn),
  )

  const networkDetails = await getHotspotNetworkDetails({
    deviceType,
    address: gateway,
    hemProgram,
  })

  const requiredDc = networkDetails?.locationStakingFee || new BN(0)

  let makerDc = new BN(0)
  if (makerKey) {
    makerDc = await getBalance(makerKey, connection, DC_MINT)
  }

  const insufficientMakerDcBal = makerDc.lt(requiredDc)
  const numLocationChanges = networkDetails?.numLocationAsserts || 0
  const isPayer = insufficientMakerDcBal || !maker || numLocationChanges >= maker.locationNonceLimit
  const isFree = !isPayer

  const dcFee = networkDetails?.locationStakingFee || new BN(0)
  let lamportFee = TXN_FEE_IN_LAMPORTS

  let hasSufficientSol = true
  let hasSufficientDc = true
  if (!isFree) {
    const ataFee = await getAtaAccountCreationFee(owner, connection)
    lamportFee = lamportFee.add(ataFee)
    hasSufficientSol = balances.lamports.gte(lamportFee)
    hasSufficientDc = balances.dc.gte(dcFee)
  }

  let dcNeeded: BN | undefined
  let hasSufficientHnt = true
  if (!hasSufficientDc) {
    const dcBalance = balances.dc || new BN(0)
    dcNeeded = dcFee.sub(dcBalance)

    const dcInCents = dcNeeded.div(new BN(100000)).mul(new BN(100))
    const oraclePriceInCents = await getOraclePriceInCentsFromSolana({ connection, cluster })
    const bonesNeeded = dcInCents.mul(BONES_IN_HNT).divRound(oraclePriceInCents)
    hasSufficientHnt = balances.bones.gte(bonesNeeded)

    if (hasSufficientHnt) {
      const txn = await burnHNTForDataCredits({
        dcAmount: dcNeeded,
        dcProgram,
        wallet: owner,
        connection,
      })
      if (txn) {
        solanaTransactions = [txn.serialize({ verifySignatures: false }), ...solanaTransactions]
        lamportFee = lamportFee.add(TXN_FEE_IN_LAMPORTS)
        hasSufficientSol = balances.lamports.gte(lamportFee)
      }
    }
  }
  const hasSufficientBalance = (hasSufficientDc || hasSufficientHnt) && hasSufficientSol

  return {
    balances,
    hasSufficientBalance,
    hasSufficientSol,
    hasSufficientDc,
    hasSufficientHnt,
    dcNeeded,
    isFree,
    solanaTransactions: solanaTransactions.map((tx) => tx.toString('base64')),
  }
}
