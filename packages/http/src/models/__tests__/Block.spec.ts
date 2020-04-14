import Block from '../Block'
import Client from '../../Client'

test('create Block from HTTP response', () => {
  const block = new Block(new Client(), {
    transaction_count: 65,
    time: 1586713800,
    prev_hash: 'AVVPMgQux0CVulZliJ44qg_WNGsprorv22GirrYWs0o',
    height: 289053,
    hash: 'SE1pltNLxJ61U33wDvf8gP9j6poylKyF3fdbk7tsw4o',
  })
  expect(block.transactionCount).toBe(65)
  expect(block.time).toBe(1586713800)
  expect(block.prevHash).toBe('AVVPMgQux0CVulZliJ44qg_WNGsprorv22GirrYWs0o')
  expect(block.height).toBe(289053)
  expect(block.hash).toBe('SE1pltNLxJ61U33wDvf8gP9j6poylKyF3fdbk7tsw4o')
})
