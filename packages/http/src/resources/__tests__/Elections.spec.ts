import nock from 'nock'
import Client from '../../Client'

const challengeFixture = (params = {}) => ({
  type: 'consensus_group_v1',
  time: 1234567890,
  proof: 'g1AAAAdFeJxF1Hs403sAx_E1cimSS46G2dyOLBk6XaREzAgjasPY49IZGoUtHHK_bBFzS8xtQnIZO0eTpIZcV0JSmbNVHJeDzGVHkTrrj-mv7z-f53k979_3-_wIAABgfyAwRHRAAbRtczaz4c9uJLb90IdpRuG4y0zM7hMDrcfeGdRc5BDbfqwQcBsgJATYkYVz2iJR-4moOyPRtrV3EyPGLTB82eWuKCpzrAUIcZc4UJ4ur9laWExjELXv91yLtz5qhEfoLbSkCqTVg6-ISbeGAVPEf65Lya6bN43DM7YO2O_rwBq_JxAqSSbzapVuP1Z2cFsg5AzRSJVod79e0Hbg-4ZKUMZ58mdOJ7wPqABQfmaVztEGQgGFSOYhikMiklhepZ-UuKBhaYCHtJdNmSDSyRjTV3EzYtO0piw4YyqW9iIw714ZPfKT_KORDwAtSQtFVeduHSl_zk4mIjB_3-HskFdWErsvu6Yt_Qb-MssHfK1BYy_aqadp9K4BIT4G--r9e16zYx_I4I6co7-1nv0L1RG4sKXOw6T9w4txFJMeUYl-GrEVQSXnW-IlE5-7XYHnDf7RxiToEPx6HBQanXYyQXLJUUVBXrHPt-dTHo8EaC-6B9UXhLreH17NXZov9b0oyhx0O6UzsBKBGtUi9H_gqNaiKA_dDeML0JHncTFSjQVFYlP5qVWuvrB3aJcGVPubw5hmkIbhQNwm_eXSykDSaJTZkZ1MF8HhZhf-kcdwDEHmc76vhj7EwxaUAey-tKWNCZ7jTQMhOtSjoO9-Rs5X-qrznA9_-bokp-rIulf-kW4cyCYFwOhiMro9I-29VNXe_G57mjHXVljQvMbU0C9mDT3FTPzaWc3eyVR18suyQCb7mUKR3841lldfDVcu0CykI9Au7E4FkJmeKDOjQtejpBB7zZ2tBrW0YF0SghlIxVZ81lBpapliifaA2GyZ_iyTlNT33undLerl6ZNruql3pDeUf8ex3OOr_93g14hNKKAuS7dOln1ADjwD6zN0iRHSRn-TwHa5cdMKQBsCEnZYdOH2mzNQvM-v3Rn29SH4BAL0MS0s2UwrE-32jqNPrfhXbCak9d1VR4Iqwrjze6fyCsxgM1JAcsLN6LdoskQr2XXkxwoJR4jM7eOKpG1PJ0XPb7snVhxn7BB4y3bPCE3eG9d4-ZXkUTPRZKaTl1ssdSK6aRfjGybAQTDGv6CXGcZPUbMbWi-RDxSK0Tl8li1Nq1LvtNoklJ7BVC-cPhPOY373VZ6y2SAHNGrtfNzQjmWyndTVbOGLYRmjW3t3O7LR4w_mshtyZ09Imvm3F4jM_DyMUtfcYuz0p6LxfvWEeNcbwPB7eJpW6WkcKH1sRFJsNkRRDMltNWs38LPyXv_5Ur4MjuCXbAo2Ur-bsuG-QsMdM3btj67BGcZIQ1ntE5TiVI6dr-c6806VHAeV8CguunlFZP757HjaoloETsf92qjBHPgNUG5Npjj_IGr4IBI-TPLXFZvo6w7LFwI0VcxKLVQIjs5WyS3EGJ-69065KU9BpK9U6o6JCy28XrWKnMi7FfsmyiPBh1LLZ1e7X9kDkl571VgFCxGZHxPZlxdZTXtK1ht5IU51JL_wjd63DmjzSWdf3jYUli421-V8H65OH6fszapMuNOi5AgePGhDojaHGYC7mA6MZyk_H1GSgx_v3QKqLcTiYJ2rhVLZHJ4An1CACEwpWHM-F9MPhFhbPMm5wFK035Utk9-EIAk8qCDiFn7CW5vbW8j8vCYrNrOT9siY08Z1y1cjEia8pGEarfcTyVf5rz9W415z5U5N_jSnA40kQyAVlmnQSufrnrIdMhHpk9Kmf3fmWmtyvb2DjwIhh3xUKLUVK-kIc71zt9DeV5cWlcqXow3cGIzhhqW4yFGxCXhJvyBEJSJf_I5usvPw4J_OfGklm6o55T8DbWgtAWf-fLgsF6-FGE0StgjcYmyWk79wSWWhY8LW3m782KNTTwZuw0WTMsasl0qA5OBqzm0joO1rTtA63qSzygdFXpkOnjeXOCpG6_8iEurenhxSMTXRnozEXBRcWy196Yk9G7e__4GipfWHnR9RTGe7uVX54SRMZq9UmElcXVjOCK5tc2oZ8stNb6qBDQEIOfsF7HdMvrb54fk-A5mbtqCHT4saKikfiasw74FIllqKmARx50ppN1TkS4vL7g6G5lwG9_piS13G_v56RkkjfK3n0s9Obhydc6anLfU58vkkcMPxkXMypZ0cetsskf4JdvLsrLdo0rTsuczZrBh3U-kyFSoIWC-ciDyTPBhJQMotvnGEMRz8P7qiJDc',
  members: [
    'fake1',
    'fake2',
    'fake3',
    'fake4',
    'fake5',
  ],
  height: 123456,
  hash: 'fake-hash',
  delay: 0,
  ...params,
})

describe('get', () => {
  nock('https://api.helium.io')
    .get('/v1/transactions/fake-hash')
    .reply(200, {
      data: challengeFixture(),
    })

  it('retrieves an election by hash', async () => {
    const client = new Client()
    const election = await client.elections.get('fake-hash')
    expect(election.hash).toBe('fake-hash')
  })
})

describe('list', () => {
  nock('https://api.helium.io')
    .get('/v1/elections')
    .reply(200, {
      data: [
        challengeFixture({ hash: 'fake-hash-1' }),
        challengeFixture({ hash: 'fake-hash-2' }),
      ],
    })

  it('lists elections', async () => {
    const client = new Client()
    const list = await client.elections.list()
    const elections = await list.take(2)
    expect(elections[0].hash).toBe('fake-hash-1')
    expect(elections[1].hash).toBe('fake-hash-2')
  })
})
