import nock from 'nock'
import Client from '../../Client'

const varsFixture = () => ({
  election_seen_penalty: 0.0033333,
  election_removal_pct: 40,
  price_oracle_public_keys: [
    '13Btezbvbwr9LhKmDQLgBnJUgjhZighEjNPLeu79dqBbmXRwoWm',
    '13CFFcmPtMvNQCpWQRXCTqXPnXtcsibDWVwiQRKpUCt4nqtF7RE',
    '1431WVQvoV7RAJpoLCaBrTKner1Soed4bk69DddcrHUTCWHV6pj',
    '136n9BEbreGUNgXJWtyzkBQcXiNzdMQ5GBoP8L2J6ZReFUAwUjy',
    '14sqAYg1qxzjKTtyHLYZdH6yDtA3KgyoARhWN1cvLZ94dZw5vEc',
    '145J6Aye86pKTJrUHREiXu7qqppZBcWY1bvWo8id7ZjxyuainYj',
    '13dUGHis1PdrSwxdseoyZKzQhc8WuWcueAWdT95sDVGDNhGRWV9',
    '14EzXp4i1xYA7SNyim6R4J5aXN1yHYKNiPrrJ2WEvoDnxmLgaCg',
    '147yRbowD1krUCC1DhhSMhpFEqnkwb26mHBow5nk9q43AakSHNA',
  ],
  max_xor_filter_size: 102400,
  max_subnet_num: 5,
  min_subnet_size: 8,
})

describe('get vars', () => {
  nock('https://api.helium.io').get('/v1/vars').reply(200, {
    data: varsFixture(),
  })

  it('retrieves chain vars', async () => {
    const client = new Client()
    const vars = await client.vars.get()
    expect(vars.electionRemovalPct).toBe(40)
    expect(vars.priceOraclePublicKeys[0]).toBe(
      '13Btezbvbwr9LhKmDQLgBnJUgjhZighEjNPLeu79dqBbmXRwoWm',
    )
  })
})
