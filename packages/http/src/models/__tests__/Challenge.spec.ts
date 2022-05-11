import Challenge, {
  HTTPChallengeObject,
  HTTPGeocodeObject,
  HTTPPathObject,
  HTTPReceiptObject,
  HTTPWitnessesObject, PathResult,
} from '../Challenge'

export const mockReceipt = {
  timestamp: 1602014780715326200,
  snr: 0,
  signal: 0,
  origin: 'p2p',
  gateway: 'fake-gateway',
  frequency: 0,
  datarate: [],
  data: 'i0E',
  channel: 0,
} as HTTPReceiptObject

// pre POCv10
export const mockLegacyWitness = (): HTTPWitnessesObject => ({
  timestamp: 1602013549762689800,
  packet_hash: 'fake-packet_hash',
  owner: 'fake-owner',
  location: 'fake-location',
  gateway: 'fake-witness-gateway',
  channel: 4,
} as HTTPWitnessesObject)

export const mockWitness = (isValid = true): HTTPWitnessesObject => ({
  timestamp: 1602013549762689800,
  snr: 7,
  signal: -103,
  packet_hash: 'fake-packet_hash',
  owner: 'fake-owner',
  location: 'fake-location',
  location_hex: 'fake-location_hex',
  is_valid: isValid,
  ...(!isValid && { invalid_reason: 'fake_invalid_reason' }),
  gateway: 'fake-witness-gateway',
  frequency: 904.7000122070312,
  datarate: [83, 70, 56, 66, 87, 49, 50, 53],
  channel: 4,
})

export const mockGeocode = {
  short_street: 'fake-short_street',
  short_state: 'fake-short_state',
  short_country: 'fake-short_country',
  short_city: 'fake-short_city',
  long_street: 'fake-long_street',
  long_state: 'fake-long_state',
  long_country: 'fake-long_country',
  long_city: 'fake-long_city',
  city_id: 'fake-city_id',
} as HTTPGeocodeObject

export const mockPathData = {
  challengee_owner: 'fake-challengee_owner',
  challengee_lon: -123.1234567890,
  challengee_location: 'fake-challengee_location',
  challengee_location_hex: 'fake-challengee_location_hex',
  challengee_lat: 12.1234567890,
  challengee: 'fake-challengee',
}

export const challengeJson = (path: HTTPPathObject[], v2?: boolean): HTTPChallengeObject => ({
  type: v2 ? 'poc_receipts_v2' : 'poc_receipts_v1',
  time: 1589918979,
  secret: 'fake-secret',
  request_block_hash: 'fake-request-block-hash',
  path,
  onion_key_hash: 'fake-onion-key-hash',
  height: 339367,
  hash: 'fake-hash',
  fee: 0,
  challenger_owner: 'fake-challenger-owner',
  challenger_lon: -123.1234567890,
  challenger_location: 'fake-challenger_location',
  challenger_location_hex: 'fake-challenger_location_hex',
  challenger_lat: 12.1234567890,
  challenger: 'fake-challenger',
} as HTTPChallengeObject)

describe('Challenge Model', () => {
  it('handles empty witness, receipt, and geocode', () => {
    const challenge = new Challenge(challengeJson([
      {
        witnesses: [] as HTTPWitnessesObject[],
        ...mockPathData,
      } as HTTPPathObject,
    ] as HTTPPathObject[]))
    expect(challenge.path[0].geocode).not.toBeDefined()
    expect(challenge.path[0].receipt).not.toBeDefined()
    expect(challenge.path[0].witnesses.length).toBe(0)
  })

  it('handles legacy poc data (pre POCv10)', () => {
    const challenge = new Challenge(challengeJson([
      {
        witnesses: [mockLegacyWitness()] as HTTPWitnessesObject[],
        ...mockPathData,
      } as HTTPPathObject,
    ] as HTTPPathObject[]))
    expect(challenge.path.length).toBe(1)
    expect(challenge.path[0].witnesses[0].isValid).toBe(true)
  })

  it('handles valid witness, receipt, and geocode', () => {
    const challenge = new Challenge(challengeJson([
      {
        witnesses: [mockWitness()] as HTTPWitnessesObject[],
        receipt: mockReceipt,
        geocode: mockGeocode,
        ...mockPathData,
      } as HTTPPathObject,
    ] as HTTPPathObject[]))
    expect(challenge.path[0].geocode).toBeDefined()
    expect(challenge.path[0].geocode.shortCity).toBe('fake-short_city')
    expect(challenge.path[0].witnesses.length).toBe(1)
    expect(challenge.path[0].receipt.gateway).toBe('fake-gateway')
  })

  it('is invalid if witness is not valid', () => {
    const challenge = new Challenge(challengeJson([
      {
        witnesses: [mockWitness(false)] as HTTPWitnessesObject[],
        receipt: mockReceipt,
        geocode: mockGeocode,
        ...mockPathData,
      } as HTTPPathObject,
    ] as HTTPPathObject[]))
    expect(challenge.path[0].result).toBe(PathResult.FAILURE)
  })

  it('has invalid reason when witness is not valid', () => {
    const challenge = new Challenge(challengeJson([
      {
        witnesses: [mockWitness(false)] as HTTPWitnessesObject[],
        receipt: mockReceipt,
        geocode: mockGeocode,
        ...mockPathData,
      } as HTTPPathObject,
    ] as HTTPPathObject[]))
    expect(challenge.path[0].witnesses[0].invalidReason).not.toBeUndefined()
    expect(challenge.path[0].witnesses[0].invalidReason).toBe('fake_invalid_reason')
  })

  describe('successful beacon', () => {
    it('challenge has challenger and challengee location data', () => {
      const challenge = new Challenge(challengeJson([
        {
          witnesses: [mockWitness()] as HTTPWitnessesObject[],
          receipt: mockReceipt,
          geocode: mockGeocode,
          ...mockPathData,
        } as HTTPPathObject,
      ] as HTTPPathObject[]))
      expect(challenge.challengerLocation).toBe('fake-challenger_location')
      expect(challenge.challengerLocationHex).toBe('fake-challenger_location_hex')
      expect(challenge.path[0].challengeeLocationHex).toBe('fake-challengee_location_hex')
      expect(challenge.path[0].challengeeLocation).toBe('fake-challengee_location')
    })

    it('first element has witness && receipt', () => {
      const challenge = new Challenge(challengeJson([
        {
          witnesses: [mockWitness()] as HTTPWitnessesObject[],
          receipt: mockReceipt,
          geocode: mockGeocode,
          ...mockPathData,
        } as HTTPPathObject,
      ] as HTTPPathObject[]))
      expect(challenge.path[0].result).toBe(PathResult.SUCCESS)
    })

    it('first element has witness but no receipt', () => {
      const challenge = new Challenge(challengeJson([
        {
          witnesses: [mockWitness()] as HTTPWitnessesObject[],
          geocode: mockGeocode,
          ...mockPathData,
        } as HTTPPathObject,
      ] as HTTPPathObject[]))
      expect(challenge.path[0].result).toBe(PathResult.SUCCESS)
    })

    it('second element has witness', () => {
      const challenge = new Challenge(challengeJson([
        {
          witnesses: [] as HTTPWitnessesObject[],
          geocode: mockGeocode,
          ...mockPathData,
        } as HTTPPathObject,
        {
          witnesses: [mockWitness()] as HTTPWitnessesObject[],
          geocode: mockGeocode,
          ...mockPathData,
        } as HTTPPathObject,
      ] as HTTPPathObject[]))
      expect(challenge.path[0].result).toBe(PathResult.SUCCESS)
      expect(challenge.path[1].result).toBe(PathResult.SUCCESS)
    })

    it('second element has receipt', () => {
      const challenge = new Challenge(challengeJson([
        {
          witnesses: [] as HTTPWitnessesObject[],
          receipt: mockReceipt,
          geocode: mockGeocode,
          ...mockPathData,
        } as HTTPPathObject,
        {
          witnesses: [] as HTTPWitnessesObject[],
          receipt: mockReceipt,
          geocode: mockGeocode,
          ...mockPathData,
        } as HTTPPathObject,
      ] as HTTPPathObject[]))
      expect(challenge.path[0].result).toBe(PathResult.SUCCESS)
      expect(challenge.path[1].result).toBe(PathResult.SUCCESS)
    })

    it('valid path then skip then witness', () => {
      const challenge = new Challenge(challengeJson([
        {
          witnesses: [mockWitness()] as HTTPWitnessesObject[],
          receipt: mockReceipt,
          geocode: mockGeocode,
          ...mockPathData,
        } as HTTPPathObject,
        {
          witnesses: [] as HTTPWitnessesObject[],
          geocode: mockGeocode,
          ...mockPathData,
        } as HTTPPathObject,
        {
          witnesses: [mockWitness()] as HTTPWitnessesObject[],
          receipt: mockReceipt,
          geocode: mockGeocode,
          ...mockPathData,
        } as HTTPPathObject,
      ] as HTTPPathObject[]))
      expect(challenge.path[0].result).toBe(PathResult.SUCCESS)
      expect(challenge.path[1].result).toBe(PathResult.SUCCESS)
      expect(challenge.path[2].result).toBe(PathResult.SUCCESS)
    })
  })
  describe('failed beacon', () => {
    it('no witness', () => {
      const challenge = new Challenge(challengeJson([
        {
          witnesses: [] as HTTPWitnessesObject[],
          geocode: mockGeocode,
          receipt: mockReceipt,
          ...mockPathData,
        } as HTTPPathObject,
      ] as HTTPPathObject[]))
      expect(challenge.path[0].result).toBe(PathResult.FAILURE)
    })
    it('no witness or receipt', () => {
      const challenge = new Challenge(challengeJson([
        {
          witnesses: [] as HTTPWitnessesObject[],
          geocode: mockGeocode,
          receipt: mockReceipt,
          ...mockPathData,
        } as HTTPPathObject,
      ] as HTTPPathObject[]))
      expect(challenge.path[0].result).toBe(PathResult.FAILURE)
    })
  })
})
