import { UseCaseRequest } from "@dddl/usecase"
import { EitherResultP, Result } from "@dddl/rop"
import { UseCaseDecorator } from "@dddl/usecase"
import {
  CQBusMiddlewareRegistrationMethods,
  CQBusMiddlewareRules,
  createCQBusMiddlewareRegistrationMethods,
} from "./cqbus-middleware"

class TestDecorator implements UseCaseDecorator<any, any, any> {
  handle(
    next: (req: UseCaseRequest<any, any, any>) => EitherResultP<any>,
  ): <Data, Res, Entities>(
    req: UseCaseRequest<Data, Res, Entities>,
  ) => EitherResultP<Res> {
    return async function (req: UseCaseRequest<any, any, any>): EitherResultP<any> {
      return Result.oku()
    }
  }
}

class SecondTestDec extends TestDecorator {}

describe("CQBus Middleware", function () {
  let methods: CQBusMiddlewareRegistrationMethods
  beforeEach(() => {
    methods = createCQBusMiddlewareRegistrationMethods()
  })
  it("should add new middleware rule", function () {
    methods.use(TestDecorator)
    expect(methods.middlewares.length).toEqual(1)
    expect(methods.middlewares.pop()).toEqual({
      middleware: TestDecorator,
      rule: CQBusMiddlewareRules.USE,
    })
  })
  it("should remove middleware rule", function () {
    methods.use(TestDecorator)
    methods.deactivate(TestDecorator)
    expect(methods.middlewares.length).toEqual(2)
    expect(methods.middlewares.pop()).toEqual({
      middleware: TestDecorator,
      rule: CQBusMiddlewareRules.DEACTIVATE,
    })
  })
  it("should add after middleware rule", function () {
    methods.use(TestDecorator)
    methods.useAfter(TestDecorator, SecondTestDec)
    expect(methods.middlewares.length).toEqual(2)
    expect(methods.middlewares.pop()).toEqual({
      middleware: SecondTestDec,
      rule: CQBusMiddlewareRules.USE_AFTER,
      secondMiddleware: TestDecorator,
    })
  })
  it("should add before middleware rule", function () {
    methods.use(TestDecorator)
    methods.useBefore(TestDecorator, SecondTestDec)
    expect(methods.middlewares.length).toEqual(2)
    expect(methods.middlewares.pop()).toEqual({
      middleware: SecondTestDec,
      rule: CQBusMiddlewareRules.USE_BEFORE,
      secondMiddleware: TestDecorator,
    })
  })
  it("should add replace middleware rule", function () {
    methods.use(TestDecorator)
    methods.replace(TestDecorator, SecondTestDec)
    expect(methods.middlewares.length).toEqual(2)
    expect(methods.middlewares.pop()).toEqual({
      middleware: SecondTestDec,
      rule: CQBusMiddlewareRules.REPLACE,
      secondMiddleware: TestDecorator,
    })
  })
})
