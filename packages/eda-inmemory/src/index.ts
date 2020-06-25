import { Constructor } from "@dddl/common"
import { EitherResultP, Result } from "@dddl/rop"
import { validateResult } from "@dddl/rop"
import { CriticalErr } from "@dddl/errors"
import { IoCUCDecorator } from "@dddl/usecase"
import { Logger, LOGGER_DI_TOKEN } from "@dddl/logger"
import {
  DSEventMeta,
  EventBusPublishOptions,
  EventHandler,
  EventRequest,
} from "@dddl/eda"
import { DSEvent } from "@dddl/eda"
import { Inject } from "typedi"

type EventMap = { event: DSEvent; meta: DSEventMeta }[]

export class EventBusInMemoryProvider {
  private events: EventMap
  private meta?: DSEventMeta

  constructor(
    public isSync: boolean,
    @Inject(LOGGER_DI_TOKEN) private logger: Logger,
    public transactionActivated: boolean = false,
    private subs: {
      [key: string]: EventHandler<any, any>[]
    } = {},
  ) {
    this.events = []
  }

  public subscribe<D extends DSEvent, R>(
    event: { new (...any: any): D },
    eventHandler: Constructor<EventHandler<D, R>>,
  ): void {
    const evName = event.name
    this.logger.info(`Subscribed event: ${evName}`)
    const handlerWithIoC = new IoCUCDecorator(eventHandler)
    if (this.subs[evName]) {
      this.subs[evName].push(handlerWithIoC)
    } else {
      this.subs[evName] = [handlerWithIoC]
    }
  }

  public fork(): EventBusInMemoryProvider {
    return new EventBusInMemoryProvider(
      this.isSync,
      this.logger,
      this.transactionActivated,
      this.subs,
    )
  }

  public setMeta(meta: DSEventMeta): void {
    this.meta = meta
  }

  // Sync
  public withTx(): void {
    this.transactionActivated = true
  }

  public async commit(): EitherResultP {
    for (let i = 0; i < this.events.length; i++) {
      const ev = this.events[i]
      const res = await this._publish(ev.event, ev.meta)
      if (res.isError()) {
        return res
      }
    }
    return Result.oku()
  }

  public rollback(): void {
    this.events = []
  }

  // Publish
  private async _publish(event: DSEvent, meta: DSEventMeta): EitherResultP {
    try {
      const eventHandlers = this.subs[event.constructor.name]
      if (!eventHandlers) {
        return Result.oku()
      }
      if (this.isSync) {
        for (let i = 0; i < eventHandlers.length; i++) {
          const err = await eventHandlers[i].handle(new EventRequest(event, meta))
          if (err.isError()) {
            return err
          }
        }
      } else {
        for (let i = 0; i < eventHandlers.length; i++) {
          setImmediate(() => {
            eventHandlers[i].handle(new EventRequest(event, meta))
          })
        }
      }
      return Result.oku()
    } catch (e) {
      this.logger.error(`ERROR IN EVENT_BUS_PROVIDER: ${e}`)
      return Result.error(e)
    }
  }

  public async publishWithMeta(
    events: DSEvent[],
    meta: DSEventMeta,
    options?: EventBusPublishOptions,
  ): EitherResultP {
    for (let i = 0; i < events.length; i++) {
      const event = events[i]
      // Validate
      const errors = await validateResult(event)
      if (errors.isError()) {
        return errors
      }
      // Get Handler
      const eventHandlers = this.subs[event.constructor.name]
      if (!eventHandlers) {
        // Send ok if no handler subscribed
        return Result.oku()
      }
      if (!options || !options.immediate) {
        if (eventHandlers.length && this.transactionActivated) {
          this.events.push({ event, meta })
          return Result.oku()
        }
      }
      // Is not, than publish it
      const res = await this._publish(event, meta)
      if (res.isError()) {
        return res
      }
    }
    return Result.oku()
  }

  public async publish(
    events: DSEvent[],
    options?: EventBusPublishOptions,
  ): EitherResultP {
    let meta: DSEventMeta
    if (this.meta) {
      meta = this.meta
    } else {
      return Result.error(new CriticalErr("no meta for publishing"))
    }
    return this.publishWithMeta(events, meta, options)
  }
}
