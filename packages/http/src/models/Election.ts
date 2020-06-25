export default interface Election {
  type: string
  time: number
  proof: string
  members: Array<string>
  height: number
  hash: string
  delay: number
}
