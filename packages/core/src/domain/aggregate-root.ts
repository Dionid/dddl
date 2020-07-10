import { Entity, EntityId, EntityWithState } from "./entity"
import { Result, OkResult } from "../rop"
import { Constructor } from "../common"
import { DomainEvent } from "../eda"

const AggregateRootBaseMixin = <TBase extends Constructor<{}>>(superclass: TBase) => {
  abstract class New extends superclass {
    private _domainEvents: DomainEvent[] = []

    get domainEvents(): DomainEvent[] {
      return this._domainEvents
    }

    protected addDomainEvent(domainEvent: DomainEvent): OkResult<undefined, Error> {
      // Add the domain event to this aggregate's list of domain events
      this._domainEvents.push(domainEvent)
      return Result.oku()
    }

    public clearEvents(): void {
      this._domainEvents.splice(0, this._domainEvents.length)
    }
  }

  return New
}

export abstract class AggregateRoot<T extends EntityId> extends AggregateRootBaseMixin(
  Entity,
)<T> {}

export abstract class AggregateRootWithState<
  T extends EntityId,
  S
> extends AggregateRootBaseMixin(EntityWithState)<T, S> {}
