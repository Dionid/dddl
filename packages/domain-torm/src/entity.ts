import { Entity, EntityId } from "common/dddl/domain/entity"
import { Column, PrimaryColumn } from "typeorm"

export class TORMEntityGeneratedId extends EntityId {
  @PrimaryColumn("uuid", { name: "id", default: () => "uuid_generate_v4()" })
  value: string

  constructor(value: string) {
    super(value)
    this.value = value
  }
}

export class TORMEntityWithGeneratedId<E extends TORMEntityGeneratedId> extends Entity<
  E
> {
  @Column(() => TORMEntityGeneratedId, { prefix: false })
  public id: E

  constructor(id: E) {
    super(id)
    this.id = id
  }
}

export class TORMEntityId extends EntityId {
  @PrimaryColumn("uuid", { name: "id" })
  value: string

  constructor(value: string) {
    super(value)
    this.value = value
  }
}

export class TORMEntity<E extends TORMEntityId> extends Entity<E> {
  @Column(() => TORMEntityId, { prefix: false })
  public id: E

  constructor(id: E) {
    super(id)
    this.id = id
  }
}
