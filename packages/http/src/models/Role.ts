/* eslint-disable no-param-reassign */
/* eslint-disable max-classes-per-file */
import DataModel from './DataModel'

export interface RoleJsonObject {
  type: string
  time: number
  role: string
  height: number
  hash: string
}

export default class Role extends DataModel {
  type!: string

  time!: number

  role!: string

  height!: number

  hash!: string

  constructor(data: Role) {
    super()
    Object.assign(this, data)
  }

  get data(): Role {
    return this
  }
}
