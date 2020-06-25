export class PublicErr extends Error {
  constructor(
    public code: number,
    message?: string,
    public customCode?: string,
    public internalMessage?: string,
  ) {
    super(message)
  }

  toString(): string {
    return JSON.stringify({
      message: this.message,
      code: this.code,
      customCode: this.customCode,
    })
  }

  toJSON(): Record<string, any> {
    return { message: this.message, code: this.code, customCode: this.customCode }
  }
}

export class CriticalErr extends PublicErr {
  isCritical = true

  constructor(internalMessage?: string) {
    super(500, "Internal server error", undefined, internalMessage)
  }
}

export class NoEntitiesErr extends CriticalErr {
  constructor(message: string) {
    super(message)
  }
}

export class NotFoundErr extends PublicErr {
  constructor(message?: string, customCode?: string, internalMessage?: string) {
    super(404, message, customCode, internalMessage)
  }
}

export class InvalidDataErr extends PublicErr {
  constructor(message?: string, customCode?: string, internalMessage?: string) {
    super(400, message, customCode, internalMessage)
  }
}

export class UnauthorizedErr extends PublicErr {
  constructor(message?: string, customCode?: string, internalMessage?: string) {
    super(401, message, customCode, internalMessage)
  }
}

export class PermissionDenied extends PublicErr {
  constructor(message?: string, customCode?: string, internalMessage?: string) {
    super(403, message, customCode, internalMessage)
    this.message = message || "Permission denied!"
  }
}
