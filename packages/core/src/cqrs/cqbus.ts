import { Constructor } from "../common"
import { UseCase, UseCaseReqData, UseCaseReqMeta, UseCaseRequest } from "../usecase"
import { EitherResultP } from "../rop"
import { UseCaseDecorator } from "../usecase"
import { CQBusMiddlewareRegistration } from "./cqbus-middleware"

export interface CQBus {
  subscribe<D extends UseCaseReqData<any>>(
    so: Constructor<D>,
    serviceObjectHandler: Constructor<UseCase<any, any, any>>,
    registerMiddleware?: CQBusMiddlewareRegistration,
  ): Error | undefined

  handle<R>(so: UseCaseReqData<R>, meta: UseCaseReqMeta): EitherResultP<R>

  use<Dec extends UseCaseDecorator<any, any, any>>(
    decorator: Constructor<Dec> | Dec,
    skipper?: (cqName: string, req: UseCaseRequest<any, any, any>) => boolean,
  ): void

  handleByName<R>(
    name: string,
    so: UseCaseReqData<R>,
    meta: UseCaseReqMeta,
  ): EitherResultP<R>
}

export const CQ_BUS_DI_TOKEN = "CQ_BUS_DI_TOKEN"
