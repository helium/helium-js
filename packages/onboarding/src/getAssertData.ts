import Balance, { CurrencyType, DataCredits } from '@helium/currency'
import OnboardingClient from './OnboardingClient'
import BN from 'bn.js'
import { DC_MINT, IOT_MINT, MOBILE_MINT, toBN, HNT_MINT } from '@helium/spl-utils'
import { subDaoKey } from '@helium/helium-sub-daos-sdk'
import { Connection, PublicKey, AccountInfo, LAMPORTS_PER_SOL, Cluster } from '@solana/web3.js'
import { init as initDc } from '@helium/data-credits-sdk'
import axios from 'axios'
import { getBalance } from '@helium/currency-utils'
import {
  AccountLayout,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountIdempotentInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token'
import {
  iotInfoKey,
  mobileInfoKey,
  rewardableEntityConfigKey,
} from '@helium/helium-entity-manager-sdk'
import { init as initHem } from '@helium/helium-entity-manager-sdk'
import * as Currency from '@helium/currency-utils'
import { HotspotType } from './types'

export const clusterByUrl = (url?: string): Cluster => {
  if (!url) return 'mainnet-beta'
  if (url.includes('mainnet' || 'https://rpc.helius.xyz')) return 'mainnet-beta'
  if (url.includes('testnet')) return 'testnet'
  if (url.includes('devnet')) return 'devnet'
  return 'mainnet-beta'
}

export const TXN_FEE_IN_LAMPORTS = 5000
export const TXN_FEE_IN_SOL = TXN_FEE_IN_LAMPORTS / LAMPORTS_PER_SOL
export const FULL_LOCATION_STAKING_FEE = 1000000 // $10 - does this need to be updated to $5? It's used as a fallback when something fails

export type HemProgram = Awaited<ReturnType<typeof initHem>>
export type DcProgram = Awaited<ReturnType<typeof initDc>>
export type AssertData = Awaited<ReturnType<typeof getAssertData>>
type Account = AccountInfo<string[]>

const getOraclePriceFromSolana = async (connection: Connection) => {
  const price = await Currency.getOraclePrice({
    tokenType: 'HNT',
    cluster: clusterByUrl(connection.rpcEndpoint),
    connection,
  })
  if (!price?.aggregate.price) {
    throw new Error('Failed to fetch oracle price')
  }

  return Balance.fromFloat(price?.aggregate.price, CurrencyType.usd)
}

const getHntBalance = async (wallet: PublicKey, connection: Connection) => {
  return Currency.getBalance({
    pubKey: wallet,
    connection,
    mint: new PublicKey(HNT_MINT),
  })
}

const getMobileBalance = async (wallet: PublicKey, connection: Connection) => {
  return Currency.getBalance({
    pubKey: wallet,
    connection,
    mint: new PublicKey(MOBILE_MINT),
  })
}

const getDcBalance = async (wallet: PublicKey, connection: Connection) => {
  return Currency.getBalance({
    pubKey: wallet,
    connection,
    mint: new PublicKey(DC_MINT),
  })
}

const getSolBalance = async (wallet: PublicKey, connection: Connection) => {
  return connection.getBalance(wallet)
}

const getBalances = async (wallet: PublicKey, connection: Connection) => {
  const solBalance = await getSolBalance(wallet, connection)
  const hntBalance = await getHntBalance(wallet, connection)
  const mobileBalance = await getMobileBalance(wallet, connection)
  const dcBalance = await getDcBalance(wallet, connection)

  return {
    hnt: Balance.fromIntAndTicker(Number(hntBalance), 'HNT'),
    mobile: Balance.fromIntAndTicker(Number(mobileBalance), 'MOBILE'),
    dc: new Balance(Number(dcBalance || 0), CurrencyType.dataCredit),
    sol: new Balance(solBalance, CurrencyType.solTokens),
  }
}

const burnHNTForDataCredits = async ({
  dcAmount,
  wallet,
  connection,
  dcProgram,
}: {
  dcAmount: number
  wallet: PublicKey
  connection: Connection
  dcProgram: DcProgram
}) => {
  const txn = await dcProgram.methods
    .mintDataCreditsV0({
      hntAmount: null,
      dcAmount: toBN(dcAmount, 0),
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
    return new Balance(0, CurrencyType.solTokens)
  } catch {
    return Balance.fromFloat(0.00203928, CurrencyType.solTokens)
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
    return toBN(configFee, 0).toNumber()
  }
  return FULL_LOCATION_STAKING_FEE
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
  const lamportsBefore = await connection.getBalance(key)
  const dcBefore = Number(await getBalance({ pubKey: key, mint: dcMint, connection }))

  let lamportsAfter = 0
  let dcAfter = 0

  if (account) {
    lamportsAfter = new BN(account.lamports.toString()).toNumber()
  } else {
    lamportsAfter = lamportsBefore
  }

  const lamportFee = lamportsBefore - lamportsAfter
  let dcFee = 0

  if (dcAccount && dcAccount.lamports > 0) {
    const tokenAccount = AccountLayout.decode(
      Buffer.from(dcAccount.data[0], dcAccount.data[1] as BufferEncoding),
    )

    const dcBalance = new BN(tokenAccount.amount.toString())
    dcAfter = dcBalance.toNumber()
    dcFee = dcBefore - dcAfter
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
    isFree: ownerFees.lamports === 0 && ownerFees.dc === 0,
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
  const walletDC = await getAssociatedTokenAddress(new PublicKey(DC_MINT), owner)

  const makerDC = await getAssociatedTokenAddress(new PublicKey(DC_MINT), maker)

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

const getAssertData = async ({
  elevation: propsElevation,
  decimalGain,
  gateway,
  nextLocation,
  maker,
  owner,
  hotspotTypes,
  onboardingClient,
  connection,
  hemProgram,
  dcProgram,
}: {
  hemProgram: HemProgram
  connection: Connection
  gateway: string
  owner: PublicKey
  decimalGain?: number
  elevation?: number
  maker: PublicKey
  nextLocation: string
  hotspotTypes: HotspotType[]
  onboardingClient: OnboardingClient
  dcProgram: DcProgram
}) => {
  const rpcEndpoint = connection.rpcEndpoint
  const oraclePrice = await getOraclePriceFromSolana(connection)
  let solanaTransactions: Buffer[] | undefined
  const gain = Math.round((decimalGain || 0) * 10.0)
  const elevation = propsElevation || 0

  const solanaAddress = owner.toBase58()
  const balances = await getBalances(owner, connection)

  const location = new BN(nextLocation, 'hex').toString()

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
          lamports: number
          dc: number
        }
        ownerFees: {
          lamports: number
          dc: number
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

        let dcFee = 0
        if (locationChanged) {
          dcFee = await getStakingFeeForType(type, hemProgram)
        }

        return {
          makerFees: {
            lamports: 0,
            dc: 0,
          },
          ownerFees: {
            lamports: TXN_FEE_IN_LAMPORTS,
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

      const makerSolFee = Balance.fromIntAndTicker(current.makerFees.lamports, 'SOL')
      const ownerSolFee = Balance.fromIntAndTicker(current.ownerFees.lamports, 'SOL')

      const makerDcFee = new Balance(current.makerFees.dc, CurrencyType.dataCredit)
      const ownerDcFee = new Balance(current.ownerFees.dc, CurrencyType.dataCredit)

      return {
        makerFees: {
          sol: acc.makerFees.sol.plus(makerSolFee),
          dc: acc.makerFees.dc.plus(makerDcFee),
        },
        ownerFees: {
          sol: acc.ownerFees.sol.plus(ownerSolFee),
          dc: acc.ownerFees.dc.plus(ownerDcFee),
        },
      }
    },
    {
      makerFees: {
        sol: new Balance(0, CurrencyType.solTokens),
        dc: new Balance(0, CurrencyType.dataCredit),
      },
      ownerFees: {
        sol: new Balance(0, CurrencyType.solTokens),
        dc: new Balance(0, CurrencyType.dataCredit),
      },
    },
  )
  const isFree = fees.ownerFees.dc.integerBalance <= 0 && fees.ownerFees.sol.integerBalance <= 0

  if (!isFree) {
    const ataFee = await getAtaAccountCreationFee(owner, connection)
    fees.ownerFees.sol = fees.ownerFees.sol.plus(ataFee)
  }

  let hasSufficientSol = balances.sol.integerBalance >= fees.ownerFees.sol.integerBalance
  const hasSufficientDc = (balances.dc?.integerBalance || 0) >= fees.ownerFees.dc.integerBalance

  let dcNeeded: Balance<DataCredits> | undefined
  let hasSufficientHnt = true
  if (!hasSufficientDc) {
    const dcFee = fees.ownerFees.dc
    const dcBalance = balances.dc || new Balance(0, CurrencyType.dataCredit)
    dcNeeded = dcFee.minus(dcBalance)
    const hntNeeded = dcNeeded.toNetworkTokens(oraclePrice)
    hasSufficientHnt = (balances.hnt?.integerBalance || 0) >= hntNeeded.integerBalance

    if (hasSufficientHnt) {
      const txn = await burnHNTForDataCredits({
        dcAmount: dcNeeded.integerBalance,
        dcProgram,
        wallet: owner,
        connection,
      })
      if (txn) {
        solanaTransactions = [txn.serialize({ verifySignatures: false }), ...solanaTransactions]
        fees.ownerFees.sol = fees.ownerFees.sol.plus(
          Balance.fromIntAndTicker(TXN_FEE_IN_LAMPORTS, 'SOL'),
        )

        hasSufficientSol = balances.sol.integerBalance >= fees.ownerFees.sol.integerBalance
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
    oraclePrice,
  }
}

export default getAssertData
