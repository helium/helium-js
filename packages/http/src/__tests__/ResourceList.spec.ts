import nock from 'nock'
import ResourceList from '../ResourceList'
import Client from '../Client'

describe('auto pagination', () => {
  it('auto paginates with asyncIterator', async () => {
    const data = [{ name: 'dog' }, { name: 'cat' }, { name: 'bird' }]
    const list = new ResourceList(data)
    const fetchedData = []
    for await (const item of list) {
      fetchedData.push(item)
    }
    expect(fetchedData).toEqual(data)
  })

  it('fetches additional pages asynchronously', async () => {
    const firstPageData = [{ name: 'cat' }, { name: 'dog'}]
    const secondPageData = [{ name: 'snake'} ,{ name: 'bird'}]
    const thirdPageData = [{ name: 'bat'} ,{ name: 'squirrel'}]

    nock('https://api.helium.io')
      .get('/v1/animals')
      .query({ cursor: 'cursor-1' })
      .reply(200, {
        data: secondPageData,
        cursor: 'cursor-2'
      })

    nock('https://api.helium.io')
      .get('/v1/animals')
      .query({ cursor: 'cursor-2' })
      .reply(200, {
        data: thirdPageData,
      })

    const fetchMore = async ({ cursor }: FetchMoreOptions = {}) => {
      const client = new Client()
      const { data: { data, cursor: nextCursor } } = await client.get('/animals', { cursor })
      return new ResourceList(data, fetchMore, nextCursor)
    }

    const list = new ResourceList(firstPageData, fetchMore, 'cursor-1')

    const fetchedData = []
    for await (const item of list) {
      fetchedData.push(item)
    }

    expect(fetchedData).toEqual([...firstPageData, ...secondPageData, ...thirdPageData])
  })
})


interface FetchMoreOptions {
  cursor?: string
}

describe('manual pagination', () => {
  it('exposes the current page data', () => {
    const data = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const list = new ResourceList(data)
    expect(list.data).toEqual(data)
  })

  it('fetches the next page of data', async () => {
    const firstPageData = [{ name: 'cat' }, { name: 'dog'}]
    const secondPageData = [{ name: 'snake'} ,{ name: 'bird'}]

    nock('https://api.helium.io')
      .get('/v1/animals')
      .query({ cursor: 'cursor-1' })
      .reply(200, {
        data: secondPageData,
      })

    const fetchMore = async ({ cursor }: FetchMoreOptions = {}) => {
      const client = new Client()
      const { data: { data } } = await client.get('/animals', { cursor })
      return new ResourceList(data, fetchMore)
    }

    const list = new ResourceList(firstPageData, fetchMore, 'cursor-1')

    const nextList = await list.nextPage()
    expect(nextList.data).toEqual(secondPageData)
  })
})
