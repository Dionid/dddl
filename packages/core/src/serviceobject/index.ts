export interface ServiceObject<Res> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handle(...any: any[]): Res
}
