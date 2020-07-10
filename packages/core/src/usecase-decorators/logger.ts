import { EitherResultP, Result } from "@dddl/rop"
import { Logger, LOGGER_DI_TOKEN } from "@dddl/logger"
import { Inject, Service } from "typedi"
import { UseCaseDecorator } from "@dddl/usecase"
import { UseCaseHandle, UseCaseRequest } from "@dddl/usecase"

@Service({ global: true })
export class LoggerDecorator implements UseCaseDecorator<any, any, any> {
  constructor(@Inject(LOGGER_DI_TOKEN) private logger: Logger) {}

  handle(next: UseCaseHandle<any, any, any>): UseCaseHandle<any, any, any> {
    return async (req: UseCaseRequest<any, any, any>): EitherResultP<any> => {
      this.logger.info({
        message: req,
        type: "REQUEST",
        command: req.data.constructor.name,
        traceId: req.meta.transactionId,
        originTraceId: req.meta.originTransactionId,
      })
      const res = await next(req)
      if (res.isError()) {
        this.logger.error({
          message: res.error,
          type: "RESPONSE",
          command: req.data.constructor.name,
          traceId: req.meta.transactionId,
          originTraceId: req.meta.originTransactionId,
        })
      } else {
        this.logger.info({
          message: res.value || "OK",
          type: "RESPONSE",
          command: req.data.constructor.name,
          traceId: req.meta.transactionId,
          originTraceId: req.meta.originTransactionId,
        })
      }
      return res
    }
  }
}
