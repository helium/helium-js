/* eslint-disable max-classes-per-file */
export default abstract class DataModel {
  abstract get data(): any
}

export class GenericDataModel extends DataModel {
  constructor(data: any) {
    super()
    Object.assign(this, data)
  }

  get data(): GenericDataModel {
    return this
  }
}
