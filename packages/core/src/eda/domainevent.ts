import { DSEvent } from "./event"

export class DomainEvent extends DSEvent {
  private isDomainEvent = true

  constructor(id: string) {
    super(id)
  }
}
