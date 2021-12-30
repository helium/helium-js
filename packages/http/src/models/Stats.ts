export type Counts = {
  blocks: number
  challenges: number
  cities: number
  consensusGroups: number
  countries: number
  hotspots: number
  hotspotsOnline: number
  transactions: number
  validators: number
  ouis: number
  hotspotsDataonly:number
  coingeckoPriceUsd: number
  coingeckoPriceGbp: number
  coingeckoPriceEur: number
}

type DcBurnStats = {
  stateChannel: number
  oui: number
  fee: number
  assertLocation: number
  addGateway: number
  total: number
}

export type DcBurns = {
  lastWeek: DcBurnStats
  lastMonth: DcBurnStats
  lastDay: DcBurnStats
}
