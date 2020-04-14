interface PageData {
  data: Array<object>
  cursor?: string
}

// class MyIterator implements Iterator<object> {
//   next(value?: any) {
//     return {
//       value: 'foo',
//       done: true
//     }
//   }
// }

interface IterateResources {
  [Symbol.iterator](): IterableIterator<object>
}

export default class ResourceList implements IterateResources {
  // private position: number = 0
  public pageData: PageData

  constructor(pageData: PageData) {
    this.pageData = pageData
    // this[Symbol.iterator] = this.generator()
  }

  *[Symbol.iterator]() {
    for (const obj of this.pageData.data) {
      yield obj
    }
  }

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
