import { any, mock, MockProxy } from "jest-mock-extended"
import { IntegrationEvent } from "../eda"
import { EventRequest } from "../eda"
import { EitherResultP, Result } from "../rop"
import { EventBusInMemoryProvider } from "./index"
import { Logger } from "../logger"

class TestIntegrationEvent extends IntegrationEvent {}

class TestIntegrationEventHandler {
  async handle(event: EventRequest<TestIntegrationEvent>): EitherResultP {
    return Result.oku()
  }
}

describe("Eventbus Provider", function () {
  let syncEbp: EventBusInMemoryProvider
  let logger: MockProxy<Logger>

  beforeEach(() => {
    logger = mock<Logger>()
    logger.info.calledWith(any())
    logger.error.calledWith(any())
    syncEbp = new EventBusInMemoryProvider(true, logger)
  })

  describe("subscribe", function () {
    it("should return success", function () {
      // syncEbp.publish()
    })
  })

  describe("publish", function () {
    it("should return success", function () {
      // syncEbp.publish()
    })
  })
})
