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

export class RoleObject extends DataModel {
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

export type AnyRole = RoleObject

export default class Role {
  public static fromJsonObject(json: RoleJsonObject): AnyRole {
    return this.toRole(json)
  }

  static toRole(json: RoleJsonObject): RoleObject {
    return new RoleObject(json)
  }
}
