import * as web3 from '@solana/web3.js'
import { Program } from '@project-serum/anchor'
import { rewardableEntityConfigKey, iotInfoKey } from '@helium/helium-entity-manager-sdk'
import { subDaoKey } from '@helium/helium-sub-daos-sdk'
import { HeliumEntityManager } from '@helium/idls/lib/types/helium_entity_manager'
import { SolHotspot } from './types'

export const getSolHotspotInfo = async ({
  mint,
  hotspotAddress,
  symbol: type,
  program,
}: {
  mint: string
  hotspotAddress: string
  symbol: 'IOT' | 'MOBILE'
  program: Program<HeliumEntityManager>
}) => {
  const sdkey = subDaoKey(new web3.PublicKey(mint))[0]
  const hckey = rewardableEntityConfigKey(sdkey, type)[0]
  const infoKey = iotInfoKey(hckey, hotspotAddress)[0]

  switch (type) {
    case 'IOT': {
      return await program.account.iotHotspotInfoV0.fetchNullable(infoKey)
    }
    case 'MOBILE': {
      return await program.account.mobileHotspotInfoV0.fetchNullable(infoKey)
    }
  }
}

export const isSolHotspot = (hotspot: any): hotspot is SolHotspot =>
  Object.keys(hotspot).includes('numLocationAsserts')
