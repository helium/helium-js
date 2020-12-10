import { diagnostics_v1 as DiagnosticsV1 } from '../../build'

const diagnosticDict: { diagnostics: { power: 'on' | 'off' } } = { diagnostics: { power: 'on' } }
describe('diagnostics_v1', () => {
  it('can encode and decode', () => {
    const diag = DiagnosticsV1.create(diagnosticDict)

    const encoded = DiagnosticsV1.encode(diag).finish()
    const base64 = Buffer.from(encoded).toString('base64')
    expect(base64).toBe('CgsKBXBvd2VyEgJvbg==')
    const decoded = DiagnosticsV1.decode(encoded)
    expect(decoded.diagnostics.power).toEqual(diagnosticDict.diagnostics.power)
  })
})
