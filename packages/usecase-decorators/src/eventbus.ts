import { Inject, Service } from "typedi"
import { UseCaseHandle, UseCaseRequest } from "../../usecase/src"
import { EitherResultP, Result } from "packages/rop/dist"
import {
  ASYNC_EVENT_BUS_PROVIDER_DI_TOKEN,
  DSEventMeta,
  EventBusProvider,
  SYNC_EVENT_BUS_PROVIDER_DI_TOKEN,
} from "common/dddl/eda/eventbus"
import { UseCaseDecorator } from "../../usecase/src"

@Service()
export class SyncEventBusProviderTransactionDecorator
  implements UseCaseDecorator<any, any, any> {
  constructor(
    @Inject(SYNC_EVENT_BUS_PROVIDER_DI_TOKEN) private eventBus: EventBusProvider,
  ) {}

  handle(next: UseCaseHandle<any, any, any>): UseCaseHandle<any, any, any> {
    return async (ctx: UseCaseRequest<any, any, any>): EitherResultP<any> => {
      this.eventBus.withTx()

      try {
        const res = await next(ctx)
        if (res.isError()) {
          await this.eventBus.rollback()
          return res
        }
        const eventResult = await this.eventBus.commit()
        if (eventResult.isError()) {
          return eventResult
        }
        return res
      } catch (e) {
        await this.eventBus.rollback()
        return Result.error(e)
      }
    }
  }
}

@Service()
export class AsyncEventBusProviderTransactionDecorator
  implements UseCaseDecorator<any, any, any> {
  constructor(
    @Inject(ASYNC_EVENT_BUS_PROVIDER_DI_TOKEN) private eventBus: EventBusProvider,
  ) {}

  handle(next: UseCaseHandle<any, any, any>): UseCaseHandle<any, any, any> {
    return async (ctx: UseCaseRequest<any, any, any>): EitherResultP<any> => {
      this.eventBus.withTx()

      try {
        const res = await next(ctx)
        if (res.isError()) {
          await this.eventBus.rollback()
          return res
        }
        await this.eventBus.commit()
        return res
      } catch (e) {
        await this.eventBus.rollback()
        return Result.error(e)
      }
    }
  }
}

@Service()
export class SyncEventBusProviderSetMetaDecorator
  implements UseCaseDecorator<any, any, any> {
  constructor(
    @Inject(SYNC_EVENT_BUS_PROVIDER_DI_TOKEN) private eventBus: EventBusProvider,
  ) {}

  handle(next: UseCaseHandle<any, any, any>): UseCaseHandle<any, any, any> {
    return async (req: UseCaseRequest<any, any, any>): EitherResultP<any> => {
      const res = await DSEventMeta.create({
        callerId: req.meta.callerId,
        transactionId: req.meta.transactionId,
      })
      if (res.isError()) {
        return res
      }
      this.eventBus.setMeta(res.value)

      return next(req)
    }
  }
}

@Service()
export class AsyncEventBusProviderSetMetaDecorator
  implements UseCaseDecorator<any, any, any> {
  constructor(
    @Inject(ASYNC_EVENT_BUS_PROVIDER_DI_TOKEN) private eventBus: EventBusProvider,
  ) {}

  handle(next: UseCaseHandle<any, any, any>): UseCaseHandle<any, any, any> {
    return async (req: UseCaseRequest<any, any, any>): EitherResultP<any> => {
      const res = await DSEventMeta.create({
        callerId: req.meta.callerId,
        originTransactionId: req.meta.transactionId,
      })
      if (res.isError()) {
        return res
      }
      this.eventBus.setMeta(res.value)

      return next(req)
    }
  }
}
