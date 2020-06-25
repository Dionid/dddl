import { UseCase, UseCaseRequest } from "@dddl/usecase"
import { Constructor } from "@dddl/common"
import { UseCaseDecorator } from "@dddl/usecase"

export type CQBusMiddleware =
  | UseCaseDecorator<any, any, any>
  | Constructor<UseCaseDecorator<any, any, any>>

export interface CQBusMiddlewareWithSkipper {
  middleware: CQBusMiddleware
  skipper?: (cqName: string, req: UseCaseRequest<any, any, any>) => boolean
}

export enum CQBusMiddlewareRules {
  USE = "USE",
  USE_BEFORE = "USE_BEFORE",
  USE_AFTER = "USE_AFTER",
  REPLACE = "REPLACE",
  DEACTIVATE = "DEACTIVATE",
}

export interface CQBusMiddlewareWithRule {
  middleware: CQBusMiddleware
  rule: CQBusMiddlewareRules
  secondMiddleware?: CQBusMiddleware
}

export interface CQBusSubscription {
  uc: UseCase<any, any, any>
  middlewares: CQBusMiddlewareWithRule[]
}

export interface CQBusMiddlewareRegistrationMethods {
  middlewares: CQBusMiddlewareWithRule[]
  // showMiddlewares: CQBusMiddlewareWithSkipper[]
  use(newMW: CQBusMiddleware): void
  useAfter(currentMW: CQBusMiddleware, newMW: CQBusMiddleware): void
  useBefore(currentMW: CQBusMiddleware, newMW: CQBusMiddleware): void
  replace(currentMW: CQBusMiddleware, newMW: CQBusMiddleware): void
  deactivate(currentMW: CQBusMiddleware): void
}

export type CQBusMiddlewareRegistration = (
  methods: CQBusMiddlewareRegistrationMethods,
) => void

export const createCQBusMiddlewareRegistrationMethods = (): CQBusMiddlewareRegistrationMethods => {
  const middlewares: CQBusMiddlewareWithRule[] = []
  const use = (newMW: CQBusMiddleware): void => {
    middlewares.push({
      middleware: newMW,
      rule: CQBusMiddlewareRules.USE,
    })
  }
  const useAfter = (currentMW: CQBusMiddleware, newMW: CQBusMiddleware): void => {
    middlewares.push({
      middleware: newMW,
      rule: CQBusMiddlewareRules.USE_AFTER,
      secondMiddleware: currentMW,
    })
  }
  const useBefore = (currentMW: CQBusMiddleware, newMW: CQBusMiddleware): void => {
    middlewares.push({
      middleware: newMW,
      rule: CQBusMiddlewareRules.USE_BEFORE,
      secondMiddleware: currentMW,
    })
  }
  const replace = (currentMW: CQBusMiddleware, newMW: CQBusMiddleware): void => {
    middlewares.push({
      middleware: newMW,
      rule: CQBusMiddlewareRules.REPLACE,
      secondMiddleware: currentMW,
    })
  }
  const deactivate = (currentMW: CQBusMiddleware): void => {
    middlewares.push({
      middleware: currentMW,
      rule: CQBusMiddlewareRules.DEACTIVATE,
    })
  }
  return {
    middlewares,
    use,
    useAfter,
    useBefore,
    replace,
    deactivate,
  }
}
