export default class ResourceList {
  public data: Array<any>
  private fetchMore?: any
  private cursor?: string
  private takeIterator?: AsyncGenerator<any, void, any>

  constructor(data: Array<any>, fetchMore?: any, cursor?: string) {
    this.data = data
    this.fetchMore = fetchMore
    this.cursor = cursor
  }

  async nextPage(): Promise<ResourceList> {
    return this.fetchMore({ cursor: this.cursor })
  }

  public get hasMore(): boolean {
    return !!this.cursor && !!this.fetchMore
  }

  async *[Symbol.asyncIterator]() {
    for (const item of this.data) {
      yield item
    }
    if (!this.hasMore) return
    yield* await this.fetchMore({ cursor: this.cursor })
  }

  async take(count: number): Promise<Array<any>> {
    if (!this.takeIterator) {
      this.takeIterator = this[Symbol.asyncIterator]()
    }
    const values = []
    while (values.length < count) {
      const { value, done } = await this.takeIterator.next()
      if (value !== undefined) values.push(value)
      if (done) return values
    }
    return values
  }

  takeReset() {
    this.takeIterator = undefined
  }
}
