import * as Joi from "@hapi/joi"
import { EitherResult, EitherResultP, Result } from "@dddl/rop"
import { Constructor } from "@dddl/common"
import { UseCase, UseCaseReqCtx, UseCaseReqMeta } from "@dddl/usecase"
import { DSEvent } from "./event"

const eventValidationSchema = Joi.object({
  callerId: Joi.string().uuid().required(),
  originTransactionId: Joi.string().uuid(),
  transactionId: Joi.string().uuid(),
})

export class DSEventMeta extends UseCaseReqMeta {
  private constructor({
    callerId,
    originTransactionId,
    transactionId,
  }: {
    callerId: string
    originTransactionId?: string
    transactionId?: string
  }) {
    super({
      callerId,
      originTransactionId,
      transactionId,
    })
  }

  static create(params: {
    callerId: string
    originTransactionId?: string
    transactionId?: string
  }): EitherResult<DSEventMeta> {
    const res = eventValidationSchema.validate(params)
    if (res.errors) {
      return Result.error(res.errors)
    }
    if (res.error) {
      return Result.error(res.error)
    }
    return Result.ok(
      new DSEventMeta({
        callerId: params.callerId,
        transactionId: params.transactionId,
        originTransactionId: params.originTransactionId,
      }),
    )
  }
}

export class EventRequest<E extends DSEvent> {
  constructor(public data: E, public meta: DSEventMeta) {}
}

export interface EventHandler<
  E extends DSEvent,
  Res,
  Ctx extends UseCaseReqCtx = Record<any, any>
> extends UseCase<E, Res, Ctx> {
  handle(req: EventRequest<E>): EitherResultP<Res>
}

export class AsyncEventHandler<
  Event extends DSEvent,
  Res,
  Ctx extends UseCaseReqCtx = Record<any, any>
> implements EventHandler<Event, Res, Ctx> {
  // Create meta from request with originTransactionId = req.meta.transactionId (that will create new DI Container)
  protected metaFromRequest(req: EventRequest<Event>): UseCaseReqMeta {
    return new UseCaseReqMeta({
      callerId: req.meta.callerId,
      originTransactionId: req.meta.originTransactionId || req.meta.transactionId,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handle(req: EventRequest<Event>): EitherResultP<Res> {
    throw new Error("not implemented")
  }
}

export class SyncEventHandler<
  Event extends DSEvent,
  Res,
  Ctx extends UseCaseReqCtx = Record<any, any>
> implements EventHandler<Event, Res, Ctx> {
  // Create meta from request with transactionId = req.meta.transactionId (that will use the same DI Container)
  protected metaFromRequest(req: EventRequest<Event>): UseCaseReqMeta {
    return new UseCaseReqMeta({
      callerId: req.meta.callerId,
      transactionId: req.meta.transactionId,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handle(req: EventRequest<Event>): EitherResultP<Res> {
    throw new Error("not implemented")
  }
}

export interface EventBusPublishOptions {
  immediate: boolean
}

export interface EventBusProvider {
  isSync: boolean
  fork(): EventBusProvider

  // Event fired in async way, after DAL Transaction commit
  subscribe<E extends DSEvent, Res, Ctx extends UseCaseReqCtx = Record<any, any>>(
    event: Constructor<E>,
    eventHandler: Constructor<EventHandler<E, Res, Ctx>>,
  ): void

  // Meta
  setMeta(meta: DSEventMeta): void

  // Publishing
  publishWithMeta(
    events: DSEvent[],
    meta: DSEventMeta,
    options?: EventBusPublishOptions,
  ): EitherResultP
  publish(events: DSEvent[], options?: EventBusPublishOptions): EitherResultP // Will throw error if no meta where specified forehand in `setMeta`

  // Sync TX
  withTx(): void
  commit(): EitherResultP
  rollback(): void
}

export const SYNC_EVENT_BUS_PROVIDER_DI_TOKEN = "SYNC_EVENT_BUS_PROVIDER_DI_TOKEN"
export const ASYNC_EVENT_BUS_PROVIDER_DI_TOKEN = "ASYNC_EVENT_BUS_PROVIDER_DI_TOKEN"

export interface EventBus {
  publishWithMeta(
    events: DSEvent[],
    meta: DSEventMeta,
    options?: EventBusPublishOptions,
  ): EitherResultP
  publish(events: DSEvent[], options?: EventBusPublishOptions): EitherResultP // Will throw error if no meta where specified forehand in `setMeta`
}

export const EVENT_BUS_DI_TOKEN = "EVENT_BUS_DI_TOKEN"
