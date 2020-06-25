import { UseCaseReqMeta, UseCaseRequest } from "@dddl/usecase"
import { EitherResultP, Result } from "@dddl/rop"
import { v4 } from "uuid"
import { UseCaseDecorator } from "@dddl/usecase"
import { any, mock, MockProxy } from "jest-mock-extended"
import { Logger } from "@dddl/logger"
import { Command, CommandHandler, CommandRequest } from "@dddl/cqrs"
import { CQBus as ICQBus } from "@dddl/cqrs"
import { CQBus } from "./index"

class TestDecorator implements UseCaseDecorator<any, any, any> {
  public used = false

  handle(
    next: (req: UseCaseRequest<any, any, any>) => EitherResultP<any>,
  ): <Data, Res, Entities>(
    req: UseCaseRequest<Data, Res, Entities>,
  ) => EitherResultP<Res> {
    return async (req: UseCaseRequest<any, any, any>): EitherResultP<any> => {
      this.used = true
      return next(req)
    }
  }
}

class SecondTestDec extends TestDecorator {}

class CommandTest extends Command {}

class CommandTestHandler implements CommandHandler<CommandTest> {
  async handle(req: CommandRequest<CommandTest>): EitherResultP {
    return Result.oku()
  }
}

describe("CQBus", function () {
  let cqbus: ICQBus
  let logger: MockProxy<Logger>

  beforeEach(() => {
    logger = mock<Logger>()
    logger.info.calledWith(any())
    logger.error.calledWith(any())
    cqbus = new CQBus(logger)
  })
  describe("middlewares", function () {
    it("should add new without skipper", function () {
      cqbus.use(TestDecorator)
    })
    it("should add new with skipper", function () {
      cqbus.use(
        TestDecorator,
        (cqName: string, req: UseCaseRequest<any, any, any>) =>
          req.data.constructor.name === CommandTest.name || cqName === CommandTest.name,
      )
    })
  })
  describe("subscribe", function () {
    it("should add new uc without middlewares", function () {
      cqbus.subscribe(CommandTest, CommandTestHandler)
    })
    it("should add new uc with middlewares", function () {
      cqbus.subscribe(
        CommandTest,
        CommandTestHandler,
        ({ use, useAfter, useBefore, replace, deactivate }) => {
          use(TestDecorator)
          useAfter(TestDecorator, TestDecorator)
          useBefore(TestDecorator, TestDecorator)
          replace(TestDecorator, TestDecorator)
          deactivate(TestDecorator)
        },
      )
    })
  })
  describe("handle", function () {
    it("should call without middlewares", async function () {
      cqbus.subscribe(CommandTest, CommandTestHandler)
      const res = await cqbus.handle(
        new CommandTest(),
        new UseCaseReqMeta({ callerId: v4() }),
      )
      if (res.isError()) {
        throw new Error("handler failed")
      }
      expect(res.isOk()).toBeTruthy()
      expect(res.value).toBeUndefined()
    })
    describe("with global middlewares", function () {
      it("should call with middlewares", async function () {
        const dec = new TestDecorator()
        cqbus.use(dec)
        cqbus.subscribe(CommandTest, CommandTestHandler)
        const res = await cqbus.handle(
          new CommandTest(),
          new UseCaseReqMeta({ callerId: v4() }),
        )
        if (res.isError()) {
          throw new Error("handler failed")
        }
        expect(res.isOk()).toBeTruthy()
        expect(res.value).toBeUndefined()
        expect(dec.used).toBeTruthy()
      })
      it("should call without middlewares", async function () {
        const dec = new TestDecorator()
        cqbus.use(
          dec,
          (cqName: string, req: UseCaseRequest<any, any, any>) =>
            req.data.constructor.name === CommandTest.name || cqName === CommandTest.name,
        )
        cqbus.subscribe(CommandTest, CommandTestHandler)
        const res = await cqbus.handle(
          new CommandTest(),
          new UseCaseReqMeta({ callerId: v4() }),
        )
        if (res.isError()) {
          throw new Error("handler failed")
        }
        expect(res.isOk()).toBeTruthy()
        expect(res.value).toBeUndefined()
        expect(dec.used).toBeFalsy()
      })
    })
    describe("with local middlewares", function () {
      it("should call with middlewares", async function () {
        const dec = new TestDecorator()
        cqbus.subscribe(CommandTest, CommandTestHandler, ({ use }) => {
          use(dec)
        })
        const res = await cqbus.handle(
          new CommandTest(),
          new UseCaseReqMeta({ callerId: v4() }),
        )
        if (res.isError()) {
          throw new Error("handler failed")
        }
        expect(res.isOk()).toBeTruthy()
        expect(res.value).toBeUndefined()
        expect(dec.used).toBeTruthy()
      })
      it("should success with deactivation", async function () {
        const dec = new TestDecorator()
        cqbus.use(dec)
        cqbus.subscribe(CommandTest, CommandTestHandler, ({ deactivate }) => {
          deactivate(dec)
        })
        const res = await cqbus.handle(
          new CommandTest(),
          new UseCaseReqMeta({ callerId: v4() }),
        )
        if (res.isError()) {
          throw new Error("handler failed")
        }
        expect(res.isOk()).toBeTruthy()
        expect(res.value).toBeUndefined()
        expect(dec.used).toBeFalsy()
      })
      it("should call with replace", async function () {
        const dec = new TestDecorator()
        const secDec = new SecondTestDec()
        cqbus.use(dec)
        cqbus.subscribe(CommandTest, CommandTestHandler, ({ replace }) => {
          replace(TestDecorator, secDec)
        })
        const res = await cqbus.handle(
          new CommandTest(),
          new UseCaseReqMeta({ callerId: v4() }),
        )
        if (res.isError()) {
          throw new Error("handler failed")
        }
        expect(res.isOk()).toBeTruthy()
        expect(res.value).toBeUndefined()
        expect(dec.used).toBeFalsy()
        expect(secDec.used).toBeTruthy()
      })
      it("should call with useAfter", async function () {
        const dec = new TestDecorator()
        const secDec = new SecondTestDec()
        cqbus.use(dec)
        cqbus.subscribe(CommandTest, CommandTestHandler, ({ useAfter }) => {
          useAfter(TestDecorator, secDec)
        })
        const res = await cqbus.handle(
          new CommandTest(),
          new UseCaseReqMeta({ callerId: v4() }),
        )
        if (res.isError()) {
          throw new Error("handler failed")
        }
        expect(res.isOk()).toBeTruthy()
        expect(res.value).toBeUndefined()
        expect(dec.used).toBeTruthy()
        expect(secDec.used).toBeTruthy()
      })
      it("should call with useBefore", async function () {
        const dec = new TestDecorator()
        const secDec = new SecondTestDec()
        cqbus.use(dec)
        cqbus.subscribe(CommandTest, CommandTestHandler, ({ useBefore }) => {
          useBefore(TestDecorator, secDec)
        })
        const res = await cqbus.handle(
          new CommandTest(),
          new UseCaseReqMeta({ callerId: v4() }),
        )
        if (res.isError()) {
          throw new Error("handler failed")
        }
        expect(res.isOk()).toBeTruthy()
        expect(res.value).toBeUndefined()
        expect(dec.used).toBeTruthy()
        expect(secDec.used).toBeTruthy()
      })
    })
  })
})
