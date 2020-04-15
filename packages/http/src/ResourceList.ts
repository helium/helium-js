// import type Client from './Client'
// class MyIterator implements Iterator<object> {
//   next(value?: any) {
//     return {
//       value: 'foo',
//       done: true
//     }
//   }
// }

// interface IterateResources {
//   [Symbol.asyncIterator](): Promise<IterableIterator<object>>
// }

export default class ResourceList { // implements IterateResources {
  public data: Array<any>
  public fetchMore?: any
  private cursor?: string

  // constructor(client: Client, route: string, data: Array<any>, model: any, cursor?: string, params: object = {}) {
  constructor(data: Array<any>, fetchMore?: any, cursor?: string) {
    this.data = data
    this.fetchMore = fetchMore
    this.cursor = cursor
  }

  async nextPage(): Promise<ResourceList> {
    return this.fetchMore({ cursor: this.cursor })
    // const { data: { data, cursor } } = await this.client.get(this.route, { ...this.params, cursor: this.cursor })
    // const resources = data.map((d: any) => new this.model(this.client, d))
    // return new ResourceList(this.client, this.route, resources, this.model, cursor, this.params)
  }

  // async nextPage(): Promise<ResourceList> {
  //   await this.delay(500)
  //   console.log(this.cursor)
  //   // TODO fetch next page with cursor
  //   const data = [{ id: 1}]
  //   const pageData = { data }
  //   return new ResourceList(pageData)
  // }

  async *[Symbol.asyncIterator]() {
    await this.delay(500)
    for (const obj of this.data) {
      yield obj
    }
  }

  async delay(duration: number) {
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve()
      }, duration)
    })
  }

  // take(count: number) {
  //   const array = []

  //   for (const obj of this) {
  //     array.push(obj)
  //     if (array.length === count) {
  //       break
  //     }
  //   }

  //   return array
  // }

  // *[Symbol.iterator]() {
  //   return new MyIterator()
  // }

  // public current(): object {
  //   return this.pageData.data[this.position]
  // }

  // public key(): number {
  //   return this.position
  // }

  // public next(): object {
  //   const item = this.pageData.data[this.position]
  //   this.position += 1
  //   return item
  // }

  // public valid(): boolean {
  //   return this.position < this.pageData.data.length
  // }

  // public next(): IteratorResult<object> {
  //   if (this.pageData.data.length === 0) throw new Error('blah')
  //   return { done: true, value: this.pageData.data[0] }
  // }

  // async *[Symbol.asyncIterator] () {
  // }
  // *[Symbol.iterator](): Iterator<any, any, any> {
  //   for (const obj of this.pageData.data) {
  //     yield obj
  //   }
  // }
  // *generator(): Iterator<any, any, any> {
  //   for (const obj of this.pageData.data) {
  //     yield obj
  //   }
  // }
  

}
// Note the * after "function"
// async function* asyncRandomNumbers() {
//   // This is a web service that returns a random number
//   const url = 'https://www.random.org/decimal-fractions/?num=1&dec=10&col=1&format=plain&rnd=new';

//   while (true) {
//     const response = await fetch(url);
//     const text = await response.text();
//     yield Number(text);
//   }
// }
