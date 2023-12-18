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
import { Connection, PublicKey, AccountInfo, Cluster, LAMPORTS_PER_SOL } from '@solana/web3.js'
import axios from 'axios'
import {
  AccountLayout,
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

type Account = AccountInfo<string[]>

const lowerFirst = (str: string) => str.charAt(0).toLowerCase() + str.slice(1)

export const deviceTypeToNetworkType = (deviceType: DeviceType): NetworkType => {
  if (deviceType === null) return 'IOT'

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
  const deviceType = types.deviceType
  if (!networkType && deviceType !== undefined) {
    networkType = deviceTypeToNetworkType(deviceType)
  }
  if (!networkType) {
    throw new Error('Could not determine network type')
  }

  try {
    const mint = networkType === 'IOT' ? IOT_MINT : MOBILE_MINT
    const subDao = subDaoKey(mint)[0]

    const configKey = rewardableEntityConfigKey(subDao, networkType)

    const entityConfig = await hemProgram.account.rewardableEntityConfigV0.fetchNullable(
      configKey[0],
    )
    if (!entityConfig) return

    if (networkType === 'IOT') {
      const [info] = iotInfoKey(configKey[0], address)
      const iotInfo = await hemProgram.account.iotHotspotInfoV0.fetch(info)

      // @ts-ignore
      const details = hotspotInfoToDetails(iotInfo)
      const iotConfig = entityConfig.settings.iotConfig

      const locationStakingFee = details.isFullHotspot
        ? iotConfig?.fullLocationStakingFee
        : iotConfig?.dataonlyLocationStakingFee

      return { ...details, locationStakingFee }
    }

    const [info] = mobileInfoKey(configKey[0], address)

    const mobileInfo = await hemProgram.account.mobileHotspotInfoV0.fetch(info)
    const deviceTypeKeys = Object.keys(mobileInfo.deviceType)
    let deviceType = ''
    if (deviceTypeKeys.length) {
      deviceType = deviceTypeKeys[0]
    }
    const mobileConfigV1 = entityConfig.settings.mobileConfigV1
    const deviceFees = mobileConfigV1?.feesByDevice.find(
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
  } catch (e) {
    const error = String(e)
    if (error.startsWith('Error: Account does not exist or has no data')) {
      // This is an expected error. It has not been onboarded to this network
      return
    }

    throw e
  }
}

const getOraclePriceFromSolana = async (opts: { connection: Connection; cluster: Cluster }) => {
  const price = await Currency.getOraclePrice({ tokenType: 'HNT', ...opts })
  if (!price?.aggregate.price) {
    throw new Error('Failed to fetch oracle price')
  }

  return new BN(price.aggregate.price)
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
  const sol = await connection.getBalance(wallet)
  const hnt = (await getBalance(wallet, connection, HNT_MINT)).div(BONES_IN_HNT)
  const dc = await getBalance(wallet, connection, DC_MINT)

  return { hnt, dc, sol: new BN(sol) }
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

export const getAtaAccountCreationFee = async (
  solanaAddress: PublicKey,
  connection: Connection,
) => {
  const ataAddress = getAssociatedTokenAddressSync(DC_MINT, solanaAddress, true)

  try {
    await getAccount(connection, ataAddress)
    return new BN(0)
  } catch {
    const minRent = await getMinimumBalanceForRentExemptAccount(connection)
    return new BN(minRent)
  }
}

export const fetchSimulatedTxn = async ({
  apiUrl,
  txnBuff,
  accountAddresses,
}: {
  apiUrl: string
  txnBuff: Buffer
  accountAddresses: string[]
}): Promise<Array<Account>> => {
  const body = {
    jsonrpc: '2.0',
    id: 1,
    method: 'simulateTransaction',
    params: [
      txnBuff.toString('base64'),
      {
        encoding: 'base64',
        commitment: 'recent',
        sigVerify: false,
        accounts: {
          encoding: 'jsonParsed',
          addresses: accountAddresses,
        },
      },
    ],
  }
  const response = await axios.post<{
    result: { value: { accounts: Account[]; logs: string[]; err?: any } }
  }>(apiUrl, body)

  if (response.data.result.value.err) {
    console.error(response.data.result.value.logs.join('\n') + 'Transaction would fail')
    throw new Error('Transaction would fail')
  }
  return response.data.result.value.accounts
}

export const getAccountFees = async ({
  dcAccount,
  account,
  connection,
  key,
  dcMint,
}: {
  key: PublicKey
  dcAccount?: Account
  account?: Account
  connection: Connection
  dcMint: PublicKey
}) => {
  const lamportsBefore = new BN(await connection.getBalance(key))
  const dcBefore = await getBalance(key, connection, dcMint)

  let lamportsAfter = new BN(0)
  let dcAfter = new BN(0)

  if (account) {
    lamportsAfter = new BN(account.lamports.toString())
  } else {
    lamportsAfter = lamportsBefore
  }

  const lamportFee = lamportsBefore.sub(lamportsAfter)
  let dcFee = new BN(0)

  if (dcAccount && dcAccount.lamports > 0) {
    const tokenAccount = AccountLayout.decode(
      Buffer.from(dcAccount.data[0], dcAccount.data[1] as BufferEncoding),
    )

    const dcBalance = new BN(tokenAccount.amount.toString())
    dcAfter = dcBalance
    dcFee = dcBefore.sub(dcAfter)
  }

  return { lamports: lamportFee, dc: dcFee }
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
  const gain = Math.round((decimalGain || 0) * 10.0)
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

  const lamportBalance = balances.sol.mul(new BN(LAMPORTS_PER_SOL))
  const dcFee = networkDetails?.locationStakingFee || new BN(0)
  let lamportFee = TXN_FEE_IN_LAMPORTS

  let hasSufficientSol = true
  let hasSufficientDc = true
  if (!isFree) {
    const ataFee = await getAtaAccountCreationFee(owner, connection)
    lamportFee = lamportFee.add(ataFee)
    hasSufficientSol = lamportBalance.gte(lamportFee)
    hasSufficientDc = balances.dc.gte(dcFee)
  }

  let dcNeeded: BN | undefined
  let hasSufficientHnt = true
  if (!hasSufficientDc) {
    const dcBalance = balances.dc || new BN(0)
    dcNeeded = dcFee.sub(dcBalance)

    const dcInDollars = dcNeeded.div(new BN(100000))
    const oraclePrice = await getOraclePriceFromSolana({ connection, cluster })
    const hntNeeded = dcInDollars.div(oraclePrice)
    hasSufficientHnt = balances.hnt.gte(hntNeeded)

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
        hasSufficientSol = lamportBalance.gte(lamportFee)
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
