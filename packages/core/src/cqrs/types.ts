import { UseCase, UseCaseReqCtx, UseCaseReqData, UseCaseRequest } from "../usecase"
import { EitherResultP } from "../rop"
import { UseCaseDecorator, UseCaseDecoratorHandle } from "../usecase"

export class Command extends UseCaseReqData<undefined> {}
export class Query<Res> extends UseCaseReqData<Res> {}
export class Hybrid<Res> extends UseCaseReqData<Res> {}

export class CommandRequest<
  Data extends Command,
  Ctx extends UseCaseReqCtx = Record<any, any>
> extends UseCaseRequest<Data, undefined, Ctx> {}
export class QueryRequest<
  Data extends Query<Res>,
  Res,
  Ctx extends UseCaseReqCtx = Record<any, any>
> extends UseCaseRequest<Data, Res, Ctx> {}
export class HybridRequest<
  Data extends Hybrid<Res>,
  Res,
  Ctx extends UseCaseReqCtx = Record<any, any>
> extends UseCaseRequest<Data, Res, Ctx> {}

export interface QueryHandler<
  Data extends Query<R>,
  R,
  Ctx extends UseCaseReqCtx = Record<any, any>
> extends UseCase<Data, R, Ctx> {
  handle(req: QueryRequest<Data, R, Ctx>): EitherResultP<R>
}

export interface CommandHandler<
  Data extends Command,
  Ctx extends UseCaseReqCtx = Record<any, any>
> extends UseCase<Data, undefined, Ctx> {
  handle(req: CommandRequest<Data, Ctx>): EitherResultP
}

export interface HybridHandler<
  Data extends Hybrid<R>,
  R,
  Ctx extends UseCaseReqCtx = Record<any, any>
> extends UseCase<Data, R, Ctx> {
  handle(req: HybridRequest<Data, R, Ctx>): EitherResultP<R>
}

// Decorators

export interface CommandHandlerDecorator<
  Data extends UseCaseReqData<undefined>,
  Ctx extends UseCaseReqCtx = Record<any, any>
> extends UseCaseDecorator<Data, undefined, Ctx> {
  handle: UseCaseDecoratorHandle<Data, undefined, Ctx>
}
export interface QueryHandlerDecorator<
  Data extends UseCaseReqData<Res>,
  Res,
  Ctx extends UseCaseReqCtx = Record<any, any>
> extends UseCaseDecorator<Data, Res, Ctx> {
  handle: UseCaseDecoratorHandle<Data, Res, Ctx>
}
export interface HybridHandlerDecorator<
  Data extends UseCaseReqData<Res>,
  Res,
  Ctx extends UseCaseReqCtx = Record<any, any>
> extends UseCaseDecorator<Data, Res, Ctx> {
  handle: UseCaseDecoratorHandle<Data, Res, Ctx>
}
