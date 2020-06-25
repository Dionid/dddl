import { UseCase, UseCaseReqMeta, UseCaseRequest } from "../../usecase/src"
import { EitherResultP, Result } from "packages/rop/dist"
import { Matcher, MockProxy } from "jest-mock-extended"
import mock from "jest-mock-extended/lib/Mock"
import { v4 } from "uuid"
import { DSEventMeta, EventBusProvider } from "common/dddl/eda/eventbus"
import {
  AsyncEventBusProviderSetMetaDecorator,
  AsyncEventBusProviderTransactionDecorator,
  SyncEventBusProviderSetMetaDecorator,
  SyncEventBusProviderTransactionDecorator,
} from "common/dddl/usecase/decorators/eventbus"
class TestUC implements UseCase<any, any, any> {
  async handle(req: UseCaseRequest<any, any, any>): EitherResultP<any, Error> {
    return Result.ok(true)
  }
}

describe("UseCase decorators (Async/Sync)EventBusProviderSetMetaDecorator", function () {
  let testUC: MockProxy<TestUC>
  let eventBus: MockProxy<EventBusProvider>
  let syncDec: SyncEventBusProviderSetMetaDecorator
  let asyncDec: AsyncEventBusProviderSetMetaDecorator
  let req: UseCaseRequest<any, any, any>

  beforeEach(() => {
    req = new UseCaseRequest<any, any>(
      v4(),
      new UseCaseReqMeta({
        callerId: v4(),
      }),
      {},
    )
    testUC = mock<TestUC>()
    eventBus = mock<EventBusProvider>()
    syncDec = new SyncEventBusProviderSetMetaDecorator(eventBus)
    asyncDec = new AsyncEventBusProviderSetMetaDecorator(eventBus)
  })

  it("(sync) should set meta from req", async function () {
    const resMeta = await DSEventMeta.create({
      callerId: req.meta.callerId,
      transactionId: req.meta.transactionId,
    })
    if (resMeta.isError()) {
      throw resMeta.error
    }
    eventBus.setMeta.calledWith(
      new Matcher(
        (meta) =>
          meta.callerId === resMeta.value.callerId &&
          meta.transactionId === resMeta.value.transactionId,
      ),
    )
    testUC.handle.calledWith(req).mockResolvedValue(Result.ok(true))
    const res = await syncDec.handle(testUC.handle)(req)
    expect(res.isOk()).toBeTruthy()
    expect(res).toEqual(Result.ok(true))
  })

  it("(async) should set meta from req", async function () {
    const resMeta = await DSEventMeta.create({
      callerId: req.meta.callerId,
      originTransactionId: req.meta.transactionId,
    })
    if (resMeta.isError()) {
      throw resMeta.error
    }
    eventBus.setMeta.calledWith(
      new Matcher(
        (meta) =>
          meta.callerId === resMeta.value.callerId &&
          meta.originTransactionId === resMeta.value.originTransactionId,
      ),
    )
    testUC.handle.calledWith(req).mockResolvedValue(Result.ok(true))
    const res = await asyncDec.handle(testUC.handle)(req)
    expect(res.isOk()).toBeTruthy()
    expect(res).toEqual(Result.ok(true))
  })
})

describe("UseCase decorators (Sync/Async)EventBusProviderTransactionDecorator", function () {
  let testUC: MockProxy<TestUC>
  let eventBus: MockProxy<EventBusProvider>
  let syncDec: SyncEventBusProviderTransactionDecorator
  let asyncDec: AsyncEventBusProviderTransactionDecorator
  let req: UseCaseRequest<any, any, any>

  beforeEach(() => {
    req = new UseCaseRequest<any, any>(
      v4(),
      new UseCaseReqMeta({
        callerId: v4(),
      }),
      {},
    )
    testUC = mock<TestUC>()
    eventBus = mock<EventBusProvider>()
    syncDec = new SyncEventBusProviderTransactionDecorator(eventBus)
    asyncDec = new AsyncEventBusProviderTransactionDecorator(eventBus)
  })

  it("(sync) should set meta from req", async function () {
    eventBus.withTx.calledWith()
    eventBus.commit.calledWith().mockResolvedValue(Result.oku())
    testUC.handle.calledWith(req).mockResolvedValue(Result.ok(true))
    const res = await syncDec.handle(testUC.handle)(req)
    expect(res.isOk()).toBeTruthy()
    expect(res).toEqual(Result.ok(true))
    expect(eventBus.withTx.mock.calls.length).toBe(1)
    expect(eventBus.commit.mock.calls.length).toBe(1)
    expect(eventBus.rollback.mock.calls.length).toBe(0)
  })

  it("(async) should set meta from req", async function () {
    eventBus.withTx.calledWith()
    eventBus.commit.calledWith().mockResolvedValue(Result.oku())
    testUC.handle.calledWith(req).mockResolvedValue(Result.ok(true))
    const res = await asyncDec.handle(testUC.handle)(req)
    expect(res.isOk()).toBeTruthy()
    expect(res).toEqual(Result.ok(true))
    expect(eventBus.withTx.mock.calls.length).toBe(1)
    expect(eventBus.commit.mock.calls.length).toBe(1)
    expect(eventBus.rollback.mock.calls.length).toBe(0)
  })
})
