import { v4 } from "uuid"
import { Matcher, mock, MockProxy } from "jest-mock-extended"
import { EitherResultP, Result } from "../rop"
import { IntegrationEvent } from "./integration-event"
import { DSEventMeta, EventBusProvider, EventRequest } from "./eventbus"
import { EventBusPublisher } from "./eventbus-publisher"

describe("Inmemory EventBus", function () {
  let eventBus: EventBusPublisher
  let syncProvider: MockProxy<EventBusProvider>
  let asyncProvider: MockProxy<EventBusProvider>

  beforeEach(function () {
    syncProvider = mock<EventBusProvider>()
    asyncProvider = mock<EventBusProvider>()
    eventBus = new EventBusPublisher(syncProvider, asyncProvider)
  })

  it("should return success on publish", async function () {
    const event = new IntegrationEvent()
    const metaOrFail = DSEventMeta.create({ callerId: v4() })
    if (metaOrFail.isError()) {
      throw metaOrFail.error
    }
    syncProvider.publish
      .calledWith(new Matcher((events) => events[0] === event))
      .mockResolvedValue(Result.oku())
    asyncProvider.publish
      .calledWith(new Matcher((events) => events[0] === event))
      .mockResolvedValue(Result.oku())
    const res = await eventBus.publish([event])
    expect(res).toEqual(Result.oku())
  })

  it("should return success on publishWithMeta", async function () {
    const event = new IntegrationEvent()
    const metaOrFail = DSEventMeta.create({ callerId: v4() })
    if (metaOrFail.isError()) {
      throw metaOrFail.error
    }
    syncProvider.publishWithMeta
      .calledWith(new Matcher((events) => events[0] === event), metaOrFail.value)
      .mockResolvedValue(Result.oku())
    asyncProvider.publishWithMeta
      .calledWith(new Matcher((events) => events[0] === event), metaOrFail.value)
      .mockResolvedValue(Result.oku())
    const res = await eventBus.publishWithMeta([event], metaOrFail.value)
    expect(res).toEqual(Result.oku())
  })
})
