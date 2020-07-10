import {
  TORMEntity,
  TORMEntityId,
  TORMEntityWithGeneratedId,
} from "common/dddl/domain/typeorm/Entity"
import { AggregateRootBaseMixin } from "common/dddl/domain/aggregate-root"

export class TORMAggregateRoot<T extends TORMEntityId> extends AggregateRootBaseMixin(
  TORMEntity,
)<T> {}
export class TORMAggregateRootWithGeneratedId<
  T extends TORMEntityId
> extends AggregateRootBaseMixin(TORMEntityWithGeneratedId)<T> {}
