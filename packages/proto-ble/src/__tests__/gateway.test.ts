import { add_gateway_v1 as AddGatewayV1, Iadd_gateway_v1 } from '../../build'

const dict: Iadd_gateway_v1 = { payer: 'tacos mcgee' }
describe('add_gateway_v1', () => {
  it('can encode and decode', () => {
    const gate = AddGatewayV1.create(dict)
    const encoded = AddGatewayV1.encode(gate).finish()
    const decoded = AddGatewayV1.decode(encoded)
    expect(decoded.payer).toEqual(dict.payer)
  })
})
