import * as web3 from '@solana/web3.js'
import { WrappedConnection } from './WrappedConnection'
import { Buffer } from 'buffer'
import {
  AssetProof,
  CompressedNFT,
  SolanaConnection,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
} from './types'
import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token'
import {
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
  createTransferInstruction,
} from '@metaplex-foundation/mpl-bubblegum'
import { AnchorProvider, Wallet, Program } from '@project-serum/anchor'
import { init } from '@helium/helium-entity-manager-sdk'
import Address from '@helium/address'
import { HeliumEntityManager } from '@helium/idls/lib/types/helium_entity_manager'
import { sendAndConfirmWithRetry } from '@helium/spl-utils'
import { getPythProgramKeyForCluster, PriceStatus, PythHttpClient } from '@pythnetwork/client'
import {
  ConcurrentMerkleTreeAccount,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from '@solana/spl-account-compression'
import bs58 from 'bs58'
import * as solUtils from './utils'

export default class Solana {
  public cluster!: web3.Cluster
  public connection!: WrappedConnection
  private solPubKey?: web3.PublicKey
  private _hemProgram: Program<HeliumEntityManager> | undefined

  private getHemProgram = async (publicKey: web3.PublicKey) => {
    if (this._hemProgram && this.solPubKey && publicKey.equals(this.solPubKey)) {
      return this._hemProgram
    }

    const provider = new AnchorProvider(
      this.connection,
      {
        publicKey,
      } as Wallet,
      {},
    )
    const nextHemProgram = await init(provider)

    this.solPubKey = publicKey
    this._hemProgram = nextHemProgram

    return nextHemProgram
  }

  constructor(cluster: web3.Cluster) {
    this.cluster = cluster
    this.connection = SolanaConnection[cluster]
  }

  static getSolanaKeypair = (secretKey: string) =>
    web3.Keypair.fromSecretKey(Buffer.from(secretKey, 'base64'))

  static stringToTransaction = (solanaTransaction: string) =>
    web3.Transaction.from(Buffer.from(solanaTransaction))

  static bufferToTransaction = (solanaTransaction: Buffer) =>
    web3.Transaction.from(solanaTransaction)

  static createAssociatedTokenAccountInstruction(
    associatedTokenAddress: web3.PublicKey,
    payer: web3.PublicKey,
    walletAddress: web3.PublicKey,
    splTokenMintAddress: web3.PublicKey,
  ) {
    const keys = [
      {
        pubkey: payer,
        isSigner: true,
        isWritable: true,
      },
      {
        pubkey: associatedTokenAddress,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: walletAddress,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: splTokenMintAddress,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: web3.SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: web3.SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ]
    return new web3.TransactionInstruction({
      keys,
      programId: SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
      data: Buffer.from([]),
    })
  }

  private getBubblegumAuthorityPDA = async (merkleRollPubKey: web3.PublicKey) => {
    const [bubblegumAuthorityPDAKey] = await web3.PublicKey.findProgramAddress(
      [merkleRollPubKey.toBuffer()],
      BUBBLEGUM_PROGRAM_ID,
    )
    return bubblegumAuthorityPDAKey
  }

  private mapProof = (assetProof: { proof: string[] }): web3.AccountMeta[] => {
    if (!assetProof.proof || assetProof.proof.length === 0) {
      throw new Error('Proof is empty')
    }
    return assetProof.proof.map((node) => ({
      pubkey: new web3.PublicKey(node),
      isSigner: false,
      isWritable: false,
    }))
  }

  static heliumAddressToSolPublicKey = (heliumAddress: string) => {
    const heliumPK = Address.fromB58(heliumAddress).publicKey
    return new web3.PublicKey(heliumPK)
  }

  static heliumAddressToSolAddress = (heliumAddress: string) => {
    return Solana.heliumAddressToSolPublicKey(heliumAddress).toBase58()
  }

  getHeliumBalance = async ({ pubKey, mint }: { pubKey: web3.PublicKey; mint: string }) => {
    const tokenAccounts = await this.connection.getTokenAccountsByOwner(pubKey, {
      programId: TOKEN_PROGRAM_ID,
    })

    const tokenAcct = tokenAccounts.value.find((ta) => {
      const accountData = AccountLayout.decode(ta.account.data)
      return accountData.mint.toBase58() === mint
    })
    if (!tokenAcct) return

    return Number(AccountLayout.decode(tokenAcct.account.data).amount)
  }

  getSolBalance = async ({ pubKey: pubKey }: { pubKey: web3.PublicKey }) => {
    return this.connection.getBalance(pubKey)
  }

  getSolHotspotInfo = async ({
    mint,
    hotspotAddress,
    pubKey,
    symbol,
  }: {
    mint: string
    hotspotAddress: string
    pubKey: web3.PublicKey
    symbol: 'IOT' | 'MOBILE'
  }) => {
    const program = await this.getHemProgram(pubKey)
    return solUtils.getSolHotspotInfo({ mint, hotspotAddress, symbol, program })
  }

  submitSolana = async ({ txn }: { txn: Buffer }) => {
    const { txid } = await sendAndConfirmWithRetry(
      this.connection,
      txn,
      { skipPreflight: true },
      'confirmed',
    )

    return txid
  }

  getOraclePriceFromSolana = async ({ tokenType }: { tokenType: 'HNT' }) => {
    const pythPublicKey = getPythProgramKeyForCluster(this.cluster)
    this.connection.getProgramAccounts
    const pythClient = new PythHttpClient(this.connection, pythPublicKey)
    const data = await pythClient.getData()

    let symbol = ''
    switch (tokenType) {
      case 'HNT':
        symbol = 'Crypto.HNT/USD'
    }

    const price = data.productPrice.get(symbol)

    if (price?.price) {
      console.log(`${symbol}: $${price.price} \xB1$${price.confidence}`)
      return price.price
    }

    console.log(
      `${symbol}: price currently unavailable. status is ${PriceStatus[price?.status || 0]}`,
    )

    // TODO: Remove and throw an error
    return 2.86
  }

  createTransferCompressedCollectableTxn = async ({
    collectable,
    owner,
    recipient,
  }: {
    collectable: CompressedNFT
    owner: web3.PublicKey
    recipient: web3.PublicKey
  }): Promise<web3.VersionedTransaction | undefined> => {
    const instructions: web3.TransactionInstruction[] = []

    const { result: assetProof } = await this.connection.getAssetProof<{
      result: AssetProof
    }>(collectable.id)

    const treeAuthority = await this.getBubblegumAuthorityPDA(
      new web3.PublicKey(assetProof.tree_id),
    )

    const leafDelegate = collectable.ownership.delegate
      ? new web3.PublicKey(collectable.ownership.delegate)
      : new web3.PublicKey(collectable.ownership.owner)
    const merkleTree = new web3.PublicKey(assetProof.tree_id)
    const tree = await ConcurrentMerkleTreeAccount.fromAccountAddress(
      this.connection,
      merkleTree,
      'confirmed',
    )
    const canopyHeight = tree.getCanopyDepth()
    const proofPath = this.mapProof(assetProof)
    const anchorRemainingAccounts = proofPath.slice(0, proofPath.length - (canopyHeight || 0))
    instructions.push(
      createTransferInstruction(
        {
          treeAuthority,
          leafOwner: new web3.PublicKey(collectable.ownership.owner),
          leafDelegate,
          newLeafOwner: recipient,
          merkleTree,
          logWrapper: SPL_NOOP_PROGRAM_ID,
          compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
          anchorRemainingAccounts,
        },
        {
          root: [...Buffer.from(bs58.decode(assetProof.root))],
          dataHash: [...Buffer.from(bs58.decode(collectable.compression.data_hash.trim()))],
          creatorHash: [...Buffer.from(bs58.decode(collectable.compression.creator_hash.trim()))],
          nonce: collectable.compression.leaf_id,
          index: collectable.compression.leaf_id,
        },
      ),
    )

    const { blockhash } = await this.connection.getLatestBlockhash()
    const messageV0 = new web3.TransactionMessage({
      payerKey: owner,
      recentBlockhash: blockhash,
      instructions,
    }).compileToLegacyMessage()
    return new web3.VersionedTransaction(web3.VersionedMessage.deserialize(messageV0.serialize()))
  }

  getHotspots = async ({
    pubKey,
    sortBy = { sortBy: 'created', sortDirection: 'desc' },
    limit = 500,
    page = 1,
    before = '',
    after = '',
  }: {
    pubKey: web3.PublicKey
    sortBy?: { sortBy: 'created'; sortDirection: 'asc' | 'desc' }
    limit?: number
    page?: number
    before?: string
    after?: string
  }) => {
    const response = await this.connection.getAssetsByOwner<{
      result: { items: CompressedNFT[] }
    }>(pubKey.toString(), sortBy, limit, page, before, after)

    return response.result.items
  }
}
