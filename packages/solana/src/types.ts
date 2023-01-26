import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import * as web3 from '@solana/web3.js'
import { WrappedConnection } from './WrappedConnection'

export const SolanaConnection = {
  devnet: new WrappedConnection('https://rpc-devnet.aws.metaplex.com/'),
  testnet: new WrappedConnection(web3.clusterApiUrl('testnet')),
  'mainnet-beta': new WrappedConnection(web3.clusterApiUrl('mainnet-beta')),
} as const

export type SolHotspot = {
  asset: PublicKey
  bumpSeed: number
  elevation: number
  gain: number
  hotspotKey: string
  isFullHotspot: boolean
  location: BN | null
  numLocationAsserts: number
}

export interface Asset {
  jsonrpc: string
  result: Result
  id: string
}

export interface Result {
  interface: string
  id: string
  content: Content
  authorities: Authority[]
  compression: Compression
  grouping: Grouping[]
  royalty: Royalty
  creators: any[]
  ownership: Ownership
  supply: Supply
  mutable: boolean
}

export interface Content {
  $schema: string
  json_uri: string
  files: File[]
  metadata: Metadata
}

export interface File {
  uri: string
  mime: string
}

export interface Metadata {
  attributes: Attribute[]
  description: string
  name: string
  symbol: string
}

export interface Attribute {
  value: any
  trait_type: string
}

export interface Authority {
  address: string
  scopes: string[]
}

export interface Compression {
  eligible: boolean
  compressed: boolean
  data_hash: string
  creator_hash: string
  asset_hash: string
  tree: string
  seq: number
  leaf_id: number
}

export interface Grouping {
  group_key: string
  group_value: string
}

export interface Royalty {
  royalty_model: string
  target: any
  percent: number
  basis_points: number
  primary_sale_happened: boolean
  locked: boolean
}

export interface Ownership {
  frozen: boolean
  delegated: boolean
  delegate: any
  ownership_model: string
  owner: string
}

export interface Supply {
  print_max_supply: number
  print_current_supply: number
  edition_nonce: number
}

export type CompressedNFT = {
  interface: string
  id: string
  content: {
    $schema: string
    json_uri: string
    files: {
      uri: string
      mime: string
    }[]
    metadata: any
  }
  authorities: {
    address: string
    scopes: string[]
  }[]
  compression: {
    eligible: boolean
    compressed: boolean
    data_hash: string
    creator_hash: string
    asset_hash: string
    tree: string
    seq: number
    leaf_id: number
  }
  grouping: any[]
  royalty: {
    royalty_model: string
    target: any
    percent: number
    basis_points: number
    primary_sale_happened: boolean
    locked: boolean
  }
  creators: any[]
  ownership: {
    frozen: boolean
    delegated: boolean
    delegate: any
    ownership_model: string
    owner: string
  }
  supply: {
    print_max_supply: number
    print_current_supply: number
    edition_nonce: number
  }
  mutable: boolean
}

export type AssetProof = {
  root: string
  proof: string[]
  node_index: number
  leaf: string
  tree_id: string
}

export const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID = new web3.PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
)

export const TXN_FEE_IN_LAMPORTS = 5000
export const TXN_FEE_IN_SOL = TXN_FEE_IN_LAMPORTS / web3.LAMPORTS_PER_SOL
