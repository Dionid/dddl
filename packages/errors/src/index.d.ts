export declare class PublicErr extends Error {
  code: number
  customCode?: string | undefined
  internalMessage?: string | undefined
  constructor(
    code: number,
    message?: string,
    customCode?: string | undefined,
    internalMessage?: string | undefined,
  )
  toString(): string
  toJSON(): Record<string, any>
}
export declare class CriticalErr extends PublicErr {
  isCritical: boolean
  constructor(internalMessage?: string)
}
export declare class NoEntitiesErr extends CriticalErr {
  constructor(message: string)
}
export declare class NotFoundErr extends PublicErr {
  constructor(message?: string, customCode?: string, internalMessage?: string)
}
export declare class InvalidDataErr extends PublicErr {
  constructor(message?: string, customCode?: string, internalMessage?: string)
}
export declare class UnauthorizedErr extends PublicErr {
  constructor(message?: string, customCode?: string, internalMessage?: string)
}
export declare class PermissionDenied extends PublicErr {
  constructor(message?: string, customCode?: string, internalMessage?: string)
}
