export class EntityId {
  value: string

  constructor(value: string) {
    this.value = value
  }

  equals(id?: EntityId): boolean {
    if (id === null || id === undefined) {
      return false
    }
    if (!(id instanceof this.constructor)) {
      return false
    }
    return id.toValue() === this.value
  }

  toString() {
    return this.value
  }

  toJSON() {
    return this.value
  }

  toValue() {
    return this.value
  }
}

export class Entity<T extends EntityId> {
  public isTransient = true

  constructor(public readonly id: T) {}

  static isEntity(v: any): v is Entity<any> {
    return v instanceof Entity
  }

  public getStringId(): string {
    return this.id.toValue()
  }

  public equals(object?: Entity<T>): boolean {
    if (object === null || object === undefined) {
      return false
    }

    if (this === object) {
      return true
    }

    if (!Entity.isEntity(object)) {
      return false
    }

    return this.id.equals(object.id)
  }
}

export class EntityWithState<T extends EntityId, S> extends Entity<T> {
  constructor(id: T, public readonly state: S) {
    super(id)
  }
}
