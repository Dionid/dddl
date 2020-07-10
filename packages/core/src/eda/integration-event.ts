import { v4 } from "uuid"
import { DSEvent } from "./event"

export class IntegrationEvent extends DSEvent {
  private isIntegrationEvent = true

  constructor(id?: string) {
    super(id || v4())
  }
}
