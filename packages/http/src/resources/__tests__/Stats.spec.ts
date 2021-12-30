import nock from 'nock'
import Client from '../../Client'

const statsFixture = () => ({
  token_supply: 33319737.03712976,
  election_times: {
    last_week: {
      stddev: 4381.802416301061,
      avg: 2491.7736625514403,
    },
    last_month: {
      stddev: 2058.844951917282,
      avg: 2258.0819529206624,
    },
    last_hour: {
      stddev: 2355.37268813239,
      avg: 3457.5,
    },
    last_day: {
      stddev: 29350.72671502,
      avg: 17517.2,
    },
  },
  block_times: {
    last_week: {
      stddev: 673.625988947502,
      avg: 69.75271049596309,
    },
    last_month: {
      stddev: 312.293385489168,
      avg: 63.87739057570978,
    },
    last_hour: {
      stddev: 21.09901328455719,
      avg: 59.53333333333333,
    },
    last_day: {
      stddev: 4253.253090144334,
      avg: 397.82488479262673,
    },
  },
})

const validatorStatsFixture = () => ({
  unstaked: {
    count: 94,
    amount: 0,
  },
  staked: {
    count: 1836,
    amount: 18360000,
  },
  cooldown: {
    count: 1,
    amount: 10000,
  },
  active: 1794,
})

const countsFixture = () => ({
  blocks: 805339,
  challenges: 19724635,
  cities: 3735,
  consensus_groups: 20778,
  countries: 66,
  hotspots: 26973,
  hotspots_online: 24000,
  transactions: 52592071,
  validators: 2942,
  ouis: 18,
  hotspots_dataonly: 893,
  coingecko_price_usd: 1251,
  coingecko_price_gbp: 897,
  coingecko_price_eur: 1054,
})

const dcBurnsFixture = () => ({
  last_week: {
    state_channel: 36154999,
    oui: 90000000,
    fee: 3122030000,
    assert_location: 15787000000,
    add_gateway: 48407000000,
    total: 67442184999,
  },
  last_month: {
    state_channel: 118063544,
    oui: 90000000,
    fee: 11040155000,
    assert_location: 53691000000,
    add_gateway: 160729000000,
    total: 225668218544,
  },
  last_day: {
    state_channel: 5137275,
    fee: 489240000,
    assert_location: 2385000000,
    add_gateway: 6930000000,
    total: 9809377275,
  },
})

describe('get stats', () => {
  nock('https://api.helium.io').get('/v1/stats').reply(200, {
    data: statsFixture(),
  })

  it('retrieves network stats', async () => {
    const client = new Client()
    const stats = await client.stats.get()
    expect(stats.tokenSupply).toBe(33319737.03712976)
  })
})

describe('get validator stats', () => {
  nock('https://api.helium.io').get('/v1/validators/stats').reply(200, {
    data: validatorStatsFixture(),
  })

  it('retrieves validators stats', async () => {
    const client = new Client()
    const stats = await client.validators.stats.get()
    expect(stats.active).toBe(1794)
  })
})

describe('get counts', () => {
  nock('https://api.helium.io').get('/v1/stats/counts').reply(200, {
    data: countsFixture(),
  })

  it('retrieves network count stats', async () => {
    const client = new Client()
    const counts = await client.stats.counts()
    expect(counts.blocks).toBe(805339)
    expect(counts.consensusGroups).toBe(20778)
    expect(counts.challenges).toBe(19724635)
    expect(counts.validators).toBe(2942)
    expect(counts.ouis).toBe(18)
    expect(counts.coingeckoPriceUsd).toBe(1251)
    expect(counts.coingeckoPriceGbp).toBe(897)
    expect(counts.coingeckoPriceEur).toBe(1054)
    expect(counts.hotspotsDataonly).toBe(893)
    expect(counts.hotspots).toBe(26973)
    expect(counts.hotspotsOnline).toBe(24000)
  })
})

describe('get dc burn stats', () => {
  nock('https://api.helium.io').get('/v1/dc_burns/stats').reply(200, {
    data: dcBurnsFixture(),
  })

  it('retrieves dc burns stats', async () => {
    const client = new Client()
    const stats = await client.stats.dcBurns()
    expect(stats.lastWeek.stateChannel).toBe(36154999)
    expect(stats.lastMonth.assertLocation).toBe(53691000000)
    expect(stats.lastDay.total).toBe(9809377275)
  })
})
