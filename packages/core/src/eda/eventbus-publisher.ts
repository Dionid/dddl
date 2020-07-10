import { Inject, Service } from "typedi"
import { EitherResultP, Result } from "@dddl/rop"
import {
  ASYNC_EVENT_BUS_PROVIDER_DI_TOKEN,
  DSEventMeta,
  EventBusProvider,
  EventBusPublishOptions,
  SYNC_EVENT_BUS_PROVIDER_DI_TOKEN,
} from "./eventbus"
import { DSEvent } from "./event"

@Service()
export class EventBusPublisher {
  constructor(
    @Inject(SYNC_EVENT_BUS_PROVIDER_DI_TOKEN) private syncProvider: EventBusProvider,
    @Inject(ASYNC_EVENT_BUS_PROVIDER_DI_TOKEN) private asyncProvider: EventBusProvider,
  ) {}

  async publishWithMeta(
    events: DSEvent[],
    meta: DSEventMeta,
    options?: EventBusPublishOptions,
  ): EitherResultP {
    const res = await this.syncProvider.publishWithMeta(events, meta, options)
    if (res.isError()) {
      return res
    }
    const asyncRes = await this.asyncProvider.publishWithMeta(events, meta, options)
    if (asyncRes.isError()) {
      return asyncRes
    }
    return Result.oku()
  }

  async publish(events: DSEvent[], options?: EventBusPublishOptions): EitherResultP {
    const res = await this.syncProvider.publish(events, options)
    if (res.isError()) {
      return res
    }
    const asyncRes = await this.asyncProvider.publish(events, options)
    if (asyncRes.isError()) {
      return asyncRes
    }
    return Result.oku()
  }
}
