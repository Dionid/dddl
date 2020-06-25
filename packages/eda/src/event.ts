import { IsUUID } from "class-validator"
import { UseCaseReqData } from "@dddl/usecase"

export class DSEvent extends UseCaseReqData<undefined> {
  private isEvent = true

  @IsUUID()
  public eventId: string

  constructor(eventId: string) {
    super()
    this.eventId = eventId
  }
}
