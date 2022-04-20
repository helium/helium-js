/* eslint-disable @typescript-eslint/no-unused-vars */
import DataModel from './models/DataModel'

interface FetchMoreFn {
  (params: object): Promise<ResourceList<any>>
}

export default class ResourceList<T extends DataModel> {
  public data: Array<T>

  private fetchMore?: FetchMoreFn

  private cursor?: string

  private takeIterator?: AsyncGenerator<any, void, any>

  constructor(data: Array<T>, fetchMore?: FetchMoreFn, cursor?: string) {
    this.data = data
    this.fetchMore = fetchMore
    this.cursor = cursor
  }

  async nextPage(): Promise<ResourceList<T>> {
    if (!this.fetchMore) {
      throw new Error('fetchMore is undefined')
    }
    return this.fetchMore({ cursor: this.cursor })
  }

  public get hasMore(): boolean {
    return !!this.cursor && !!this.fetchMore
  }

  async* [Symbol.asyncIterator](): AsyncGenerator<any, void, any> {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of this.data) {
      yield item
    }
    if (!this.fetchMore || !this.cursor) return
    yield* await this.fetchMore({ cursor: this.cursor })
  }

  async take(count: number): Promise<Array<T>> {
    if (!this.takeIterator) {
      this.takeIterator = this[Symbol.asyncIterator]()
    }
    const values = []
    while (values.length < count) {
      // eslint-disable-next-line no-await-in-loop
      const { value, done } = await this.takeIterator.next()
      if (value !== undefined) values.push(value)
      if (done) return values
    }
    return values
  }

  takeReset() {
    this.takeIterator = undefined
  }

  async takeJSON(count: number): Promise<Omit<T, 'client'>[]> {
    const values = await this.take(count)
    return values.map((d) => d.data)
  }
}
