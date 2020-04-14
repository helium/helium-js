import ResourceList from '../ResourceList'

test('the iterator', () => {
  const data = [{ id: 1 }, { id: 2 }, { id: 3 }]
  const list = new ResourceList({ data })
  expect([...list]).toEqual(data)
  // expect(list.next()).toBe({ value: data[0], done: false })
})
