import OnboardingClient from './OnboardingClient'
import BN from 'bn.js'
import {
  DC_MINT,
  IOT_MINT,
  MOBILE_MINT,
  toBN,
  HNT_MINT,
  heliumAddressToSolPublicKey,
} from '@helium/spl-utils'
import { subDaoKey } from '@helium/helium-sub-daos-sdk'
import { Connection, PublicKey, AccountInfo, Cluster } from '@solana/web3.js'
import axios from 'axios'
import {
  AccountLayout,
  createAssociatedTokenAccountIdempotentInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token'
import {
  iotInfoKey,
  mobileInfoKey,
  rewardableEntityConfigKey,
} from '@helium/helium-entity-manager-sdk'
import * as Currency from '@helium/currency-utils'
import {
  DC_TO_USD_MULTIPLIER,
  DcProgram,
  FULL_LOCATION_STAKING_FEE,
  HemProgram,
  HotspotType,
  TXN_FEE_IN_LAMPORTS,
} from './types'

type Account = AccountInfo<string[]>

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
  const hnt = await getBalance(wallet, connection, HNT_MINT)
  const mobile = await getBalance(wallet, connection, MOBILE_MINT)
  const dc = await getBalance(wallet, connection, DC_MINT)

  return { hnt, mobile, dc, sol: new BN(sol) }
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
    return new BN(0.00203928)
  }
}

const getStakingFeeForType = async (type: HotspotType, hemProgram: HemProgram) => {
  const isIOT = type === 'IOT'
  const mint = isIOT ? IOT_MINT : MOBILE_MINT
  const subDao = subDaoKey(mint)[0]

  const configKey = rewardableEntityConfigKey(subDao, type)

  const entityConfig = await hemProgram?.account.rewardableEntityConfigV0.fetchNullable(
    configKey[0],
  )
  const config = isIOT ? entityConfig?.settings.iotConfig : entityConfig?.settings.mobileConfig

  // @ts-ignore
  const configFee = config?.fullLocationStakingFee as BN
  if (configFee) {
    return toBN(configFee, 0)
  }
  return new BN(FULL_LOCATION_STAKING_FEE)
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
    console.error(response.data.result.value.logs.join('\n'))
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

const estimateFees = async ({
  connection,
  owner,
  maker,
  dcMint,
}: {
  owner: { key: PublicKey; account: Account; dcAccount: Account }
  maker: { key: PublicKey; account: Account; dcAccount: Account }
  connection: Connection
  dcMint: PublicKey
}) => {
  const makerFees = await getAccountFees({ connection, ...maker, dcMint })
  const ownerFees = await getAccountFees({ connection, ...owner, dcMint })

  return {
    makerFees,
    ownerFees,
    isFree: ownerFees.lamports.eq(new BN(0)) && ownerFees.dc.eq(new BN(0)),
  }
}

const estimateMetaTxnFees = async (
  buff: Buffer,
  {
    maker,
    connection,
    owner,
    rpcEndpoint,
  }: { maker: PublicKey; connection: Connection; owner: PublicKey; rpcEndpoint: string },
) => {
  const walletDC = getAssociatedTokenAddressSync(new PublicKey(DC_MINT), owner)
  const makerDC = getAssociatedTokenAddressSync(new PublicKey(DC_MINT), maker)

  const [makerAccount, makerDcAccount, ownerAccount, ownerDcAccount] = await fetchSimulatedTxn({
    apiUrl: rpcEndpoint,
    accountAddresses: [maker.toString(), makerDC.toString(), owner.toString(), walletDC.toString()],
    txnBuff: buff,
  })

  const fees = await estimateFees({
    connection,
    owner: {
      key: owner,
      account: ownerAccount,
      dcAccount: ownerDcAccount,
    },
    maker: { key: maker, account: makerAccount, dcAccount: makerDcAccount },
    dcMint: new PublicKey(DC_MINT),
  })
  return fees
}

export const getAssertData = async ({
  elevation: propsElevation,
  decimalGain,
  gateway,
  nextLocation,
  maker: propsMaker,
  owner,
  hotspotTypes,
  onboardingClient,
  connection,
  hemProgram,
  dcProgram,
  cluster,
}: {
  hemProgram: HemProgram
  connection: Connection
  gateway: string
  owner: PublicKey
  decimalGain?: number
  elevation?: number
  maker?: PublicKey
  nextLocation: string
  hotspotTypes: HotspotType[]
  onboardingClient: OnboardingClient
  dcProgram: DcProgram
  cluster: Cluster
}) => {
  const rpcEndpoint = connection.rpcEndpoint
  const oraclePrice = await getOraclePriceFromSolana({ connection, cluster })
  let solanaTransactions: Buffer[] | undefined
  const gain = Math.round((decimalGain || 0) * 10.0)
  const elevation = propsElevation || 0

  const solanaAddress = owner.toBase58()
  const balances = await getBalances(owner, connection)

  const location = new BN(nextLocation, 'hex').toString()

  let foundMaker = propsMaker
  if (!foundMaker) {
    const onboardingRecord = await onboardingClient.getOnboardingRecord(gateway)

    if (onboardingRecord.data?.maker.address) {
      foundMaker = heliumAddressToSolPublicKey(onboardingRecord.data?.maker.address)
    }
  }
  if (!foundMaker) {
    throw new Error('Could not determine hotspot maker')
  }

  const maker = foundMaker

  const solResponses = await Promise.all(
    hotspotTypes.map((type) =>
      onboardingClient.updateMetadata({
        type,
        solanaAddress,
        hotspotAddress: gateway,
        location,
        elevation,
        gain,
      }),
    ),
  )

  solanaTransactions = solResponses
    .flatMap((r) => r.data?.solanaTransactions || [])
    .map((txn) => Buffer.from(txn))

  let simulatedFees: (
    | {
        makerFees: {
          lamports: BN
          dc: BN
        }
        ownerFees: {
          lamports: BN
          dc: BN
        }
        isFree: boolean
      }
    | undefined
  )[]
  try {
    simulatedFees = await Promise.all(
      solanaTransactions.map((t) =>
        estimateMetaTxnFees(t, {
          maker,
          connection,
          owner,
          rpcEndpoint,
        }),
      ),
    )
  } catch (e: any) {
    if (!e.message.includes('Transaction would fail')) {
      throw e
    }
    simulatedFees = await Promise.all(
      hotspotTypes.map(async (type) => {
        const mint = type === 'IOT' ? IOT_MINT : MOBILE_MINT
        const subDao = subDaoKey(mint)[0]
        const configKey = rewardableEntityConfigKey(subDao, type.toUpperCase())

        let prevLocation: BN | null | undefined
        if (type === 'IOT') {
          const [info] = iotInfoKey(configKey[0], gateway)
          const iot = await hemProgram?.account.iotHotspotInfoV0.fetch(info)
          prevLocation = iot?.location
        } else {
          const [info] = mobileInfoKey(configKey[0], gateway)
          const mobile = await hemProgram?.account.mobileHotspotInfoV0.fetch(info)
          prevLocation = mobile?.location
        }

        let locationChanged = true

        if (nextLocation && prevLocation) {
          locationChanged = !prevLocation.eq(new BN(nextLocation, 'hex'))
        }

        let dcFee = new BN(0)
        if (locationChanged) {
          dcFee = await getStakingFeeForType(type, hemProgram)
        }

        return {
          makerFees: {
            lamports: new BN(0),
            dc: new BN(0),
          },
          ownerFees: {
            lamports: new BN(TXN_FEE_IN_LAMPORTS),
            dc: dcFee,
          },
          isFree: false,
        }
      }),
    )
  }

  const fees = simulatedFees.reduce(
    (acc, current) => {
      if (!current) return acc

      const makerSolFee = current.makerFees.lamports
      const ownerSolFee = current.ownerFees.lamports

      const makerDcFee = current.makerFees.dc
      const ownerDcFee = current.ownerFees.dc

      return {
        makerFees: {
          sol: acc.makerFees.sol.add(makerSolFee),
          dc: acc.makerFees.dc.add(makerDcFee),
        },
        ownerFees: {
          sol: acc.ownerFees.sol.add(ownerSolFee),
          dc: acc.ownerFees.dc.add(ownerDcFee),
        },
      }
    },
    {
      makerFees: {
        sol: new BN(0),
        dc: new BN(0),
      },
      ownerFees: {
        sol: new BN(0),
        dc: new BN(0),
      },
    },
  )
  const isFree = fees.ownerFees.dc.lte(new BN(0)) && fees.ownerFees.sol.lte(new BN(0))

  if (!isFree) {
    const ataFee = await getAtaAccountCreationFee(owner, connection)
    fees.ownerFees.sol = fees.ownerFees.sol.add(ataFee)
  }

  let hasSufficientSol = balances.sol.gte(fees.ownerFees.sol)
  const hasSufficientDc = balances.dc.gte(fees.ownerFees.dc)

  let dcNeeded: BN | undefined
  let hasSufficientHnt = true
  if (!hasSufficientDc) {
    const dcFee = fees.ownerFees.dc
    const dcBalance = balances.dc || new BN(0)
    dcNeeded = dcFee.sub(dcBalance)

    const dcInDollars = dcNeeded.mul(new BN(DC_TO_USD_MULTIPLIER))
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
        fees.ownerFees.sol = fees.ownerFees.sol.add(new BN(TXN_FEE_IN_LAMPORTS))

        hasSufficientSol = balances.sol.gte(fees.ownerFees.sol)
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
    ...fees,
    isFree,
    solanaTransactions: solanaTransactions.map((tx) => tx.toString('base64')),
  }
}
