import { assert_loc_v1 as AssertLocationV1, Iassert_loc_v1 } from '../../build'

const loc: Iassert_loc_v1 = {
  lat: 88.0,
  lon: -44.0,
  owner: 'Joan',
  payer: 'Bear',
}

describe('assert_loc_v1', () => {
  it('can encode and decode', () => {
    const assLoc = AssertLocationV1.create(loc)
    const encoded = AssertLocationV1.encode(assLoc).finish()
    const decoded = AssertLocationV1.decode(encoded)
    expect(decoded.lat).toEqual(loc.lat)
    expect(decoded.lon).toEqual(loc.lon)
    expect(decoded.owner).toEqual(loc.owner)
    expect(decoded.payer).toEqual(loc.payer)
  })
})
