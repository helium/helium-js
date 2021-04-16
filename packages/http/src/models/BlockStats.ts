export type BlockStat = {
  stddev: number,
  avg:number
}

type BlockStats = {
  lastWeek: BlockStat
  lastMonth: BlockStat
  lastHour: BlockStat
  lastDay: BlockStat
}

export default BlockStats
