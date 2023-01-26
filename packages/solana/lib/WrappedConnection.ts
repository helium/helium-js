import { Commitment, Connection, ConnectionConfig } from '@solana/web3.js'
import axios, { AxiosInstance } from 'axios'

export class WrappedConnection extends Connection {
  axiosInstance: AxiosInstance

  constructor(
    endpoint: string,
    commitmentOrConfig?: Commitment | ConnectionConfig
  ) {
    super(endpoint, commitmentOrConfig || 'confirmed')
    this.axiosInstance = axios.create({
      baseURL: endpoint,
    })
  }

  async getAsset<T>(assetId: string): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>('get_asset', {
        jsonrpc: '2.0',
        method: 'get_asset',
        id: 'rpd-op-123',
        params: [assetId],
      })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getAssetsByOwner<T>(
    assetId: string,
    sortBy: { sortBy: 'created'; sortDirection: 'asc' | 'desc' },
    limit: number,
    page: number,
    before: string,
    after: string
  ): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>('get_assets_by_owner', {
        jsonrpc: '2.0',
        method: 'get_assets_by_owner',
        id: 'rpd-op-123',
        params: [assetId, sortBy, limit, page, before, after],
      })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getAssetProof<T>(assetId: string): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>('get_asset_proof', {
        jsonrpc: '2.0',
        method: 'get_asset_proof',
        id: 'rpd-op-123',
        params: [assetId],
      })
      return response.data
    } catch (error) {
      console.error(error)
      throw error
    }
  }
}
