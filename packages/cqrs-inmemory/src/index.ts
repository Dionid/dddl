import { Constructor } from "@dddl/common"
import {
  UseCase,
  UseCaseHandle,
  UseCaseReqData,
  UseCaseReqMeta,
  UseCaseRequest,
} from "@dddl/usecase"
import { EitherResultP, Result } from "@dddl/rop"
import { validateResult } from "@dddl/rop"
import { CriticalErr } from "@dddl/errors"
import { Container, Inject } from "typedi"
import {
  getContainerInstanceIdFromReq,
  IoCUCDecorator,
  UseCaseDecorator,
} from "@dddl/usecase"
import { LOGGER_DI_TOKEN, Logger } from "@dddl/logger"
import {
  CQBusMiddleware,
  CQBusMiddlewareRegistration,
  CQBusMiddlewareRegistrationMethods,
  CQBusMiddlewareRules,
  CQBusMiddlewareWithRule,
  CQBusMiddlewareWithSkipper,
  CQBusSubscription,
  createCQBusMiddlewareRegistrationMethods,
} from "@dddl/cqbus"

export class CQBus {
  constructor(
    @Inject(LOGGER_DI_TOKEN) private logger: Logger,
    private subscriptions: { [key: string]: CQBusSubscription } = {},
    private globalMiddlewares: CQBusMiddlewareWithSkipper[] = [],
  ) {}

  private applyMiddlewares<Res>(
    middlewares: CQBusMiddlewareWithSkipper[],
    commandQueryName: string,
    req: UseCaseRequest<UseCaseReqData<Res>, Res, any>,
    initialHandler: UseCaseHandle<UseCaseReqData<Res>, Res, any>,
  ): UseCaseHandle<UseCaseReqData<Res>, Res, any> {
    let resultHandler = initialHandler
    for (let i = middlewares.length - 1; i >= 0; i--) {
      const middlewareContainer = middlewares[i]
      const { middleware, skipper } = middlewareContainer
      // . If Skipper exist than check it
      if (skipper && skipper(commandQueryName, req)) {
        continue
      }
      let decorator: UseCaseDecorator<any, any, any>
      if (typeof middleware === "function") {
        decorator = Container.of(getContainerInstanceIdFromReq(req)).get(middleware)
      } else {
        decorator = middleware
      }
      resultHandler = decorator.handle(resultHandler)
    }
    return resultHandler
  }

  private mwsAreEqual(f: CQBusMiddleware, s: CQBusMiddleware): boolean {
    if (f === s) {
      return true
    }
    if (typeof s === "function") {
      // TODO. Think more about `instanceof` and `.constructor` check
      return f.constructor === s
    }
    if (typeof f === "function") {
      // TODO. Think more about `instanceof` and `.constructor` check
      return s.constructor === f
    }
    throw new CriticalErr("No equality found")
  }

  private getMwName(mw: CQBusMiddleware): string {
    if (typeof mw === "function") {
      return mw.name
    }
    return mw.constructor.name
  }

  private mergeMWs(
    mwArray: CQBusMiddlewareWithSkipper[] = [],
    newMW: CQBusMiddlewareWithRule,
  ): CQBusMiddlewareWithSkipper[] {
    let result = [...mwArray]
    const { rule, middleware, secondMiddleware } = newMW
    const mwWithSkipper = {
      middleware: middleware,
    }
    if (
      rule === CQBusMiddlewareRules.REPLACE ||
      rule === CQBusMiddlewareRules.USE_AFTER ||
      rule === CQBusMiddlewareRules.USE_BEFORE
    ) {
      if (!secondMiddleware) {
        throw new CriticalErr(
          `if you want to use REPLACE you need to specify "secondMiddleware"`,
        )
      }
      const i = result.findIndex((v) => this.mwsAreEqual(v.middleware, secondMiddleware))
      if (i < 0) {
        this.logger.warn(`No middleware like this: ${this.getMwName(secondMiddleware)}`)
        return result
      }
      switch (rule) {
        case CQBusMiddlewareRules.USE_AFTER:
          result.splice(i + 1, 0, mwWithSkipper)
          break
        case CQBusMiddlewareRules.USE_BEFORE:
          result.splice(i, 0, mwWithSkipper)
          break
        case CQBusMiddlewareRules.REPLACE:
          result[i] = mwWithSkipper
          break
      }
      return result
    }
    if (rule === CQBusMiddlewareRules.USE) {
      result.push(mwWithSkipper)
    } else if (rule === CQBusMiddlewareRules.DEACTIVATE) {
      result = result.filter((v) => !this.mwsAreEqual(v.middleware, newMW.middleware))
    }
    return result
  }

  private formAndApplyMiddlewares<Res>(
    commandQueryName: string,
    sub: CQBusSubscription,
    req: UseCaseRequest<UseCaseReqData<Res>, Res, any>,
  ): UseCaseHandle<UseCaseReqData<Res>, Res, any> {
    let middlewares = this.globalMiddlewares
    if (sub.middlewares.length) {
      for (let i = 0; i < sub.middlewares.length; i++) {
        const mw = sub.middlewares[i]
        middlewares = this.mergeMWs(middlewares, mw)
      }
    }
    const handlerWithMiddlewares = this.applyMiddlewares(
      middlewares,
      commandQueryName,
      req,
      sub.uc.handle,
    )
    return handlerWithMiddlewares
  }

  // Add new middleware
  use<Dec extends UseCaseDecorator<any, any, any>>(
    decorator: Constructor<Dec> | Dec,
    skipper?: (commandQueryName: string, req: UseCaseRequest<any, any, any>) => boolean,
  ): void {
    this.globalMiddlewares.push({
      middleware: decorator,
      skipper,
    })
  }

  subscribe<D extends UseCaseReqData<any>>(
    so: Constructor<D>,
    serviceObjectHandler: Constructor<UseCase<any, any, any>>,
    registerMiddleware?: CQBusMiddlewareRegistration,
  ): Error | undefined {
    const soName = so.name
    if (this.subscriptions[soName]) {
      return new Error(`Handler ${soName} is already subscribed`)
    }
    // Getting IoC decorated UseCase
    const uc = new IoCUCDecorator(serviceObjectHandler)
    // Creating middlewares
    let middlewares: CQBusMiddlewareWithRule[] = []
    if (registerMiddleware) {
      const methods: CQBusMiddlewareRegistrationMethods = createCQBusMiddlewareRegistrationMethods()
      registerMiddleware(methods)
      middlewares = methods.middlewares
    }
    this.subscriptions[soName] = {
      uc,
      middlewares,
    }
    this.logger.info(`Subscribed command: ${soName}`)
  }

  // This handler needed if we can't get `commandQueryName` by `so` class.name
  async handleByName<Res>(
    commandQueryName: string,
    data: UseCaseReqData<Res>,
    meta: UseCaseReqMeta,
  ): EitherResultP<Res> {
    // . Validate
    const error = await validateResult(data)
    if (error.isError()) {
      return Result.error(error.error)
    }
    // . Get subscription handler
    const subscription = this.subscriptions[commandQueryName]
    if (!subscription) {
      return Result.error(
        new CriticalErr(`No subscription with name: ${commandQueryName}!`),
      )
    }
    // . Create request from data and meta
    const req = new UseCaseRequest(data, meta, {})
    // . Form and apply middlewares
    const handlerWithMiddlewares = this.formAndApplyMiddlewares<Res>(
      commandQueryName,
      subscription,
      req,
    )
    // . Fire
    return handlerWithMiddlewares(req)
  }

  // Handle command or query
  async handle<Res>(data: UseCaseReqData<Res>, meta: UseCaseReqMeta): EitherResultP<Res> {
    return this.handleByName(data.constructor.name, data, meta)
  }
}
