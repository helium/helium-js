export default class ResourceList {
  public data: Array<any>
  private fetchMore?: any
  private cursor?: string

  constructor(data: Array<any>, fetchMore?: any, cursor?: string) {
    this.data = data
    this.fetchMore = fetchMore
    this.cursor = cursor
  }

  async nextPage(): Promise<ResourceList> {
    console.log('fetching next page')
    console.log('cursor', this.cursor)
    return this.fetchMore({ cursor: this.cursor })
  }

  public get hasMore(): boolean {
    return !!this.cursor && !!this.fetchMore
  }

  async *[Symbol.asyncIterator]() {
    for (const obj of this.data) {
      yield obj
    }
    while (this.hasMore) {
      const nextList = await this.fetchMore({ cursor: this.cursor })
      this.cursor = nextList.cursor
      this.data = nextList.data
      for (const obj of this.data) {
        yield obj
      }
    }
  }
}
