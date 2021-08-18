export type Counts = {
  blocks: number
  challenges: number
  cities: number
  consensusGroups: number
  countries: number
  hotspots: number
  transactions: number
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
