import { Service } from "typedi"
import { UseCaseHandle, UseCaseRequest } from "@dddl/usecase"
import { EitherResultP, Result } from "@dddl/rop"
import { UnauthorizedErr } from "@dddl/errors"
import { UseCaseDecorator } from "@dddl/usecase"

@Service({ global: true })
class AuthenticatedDecorator implements UseCaseDecorator<any, any, any> {
  handle(next: UseCaseHandle<any, any, any>): UseCaseHandle<any, any, any> {
    return async (ctx: UseCaseRequest<any, any, any>): EitherResultP<any> => {
      if (!ctx.meta.callerId) {
        return Result.error(new UnauthorizedErr())
      }
      return next(ctx)
    }
  }
}

export { AuthenticatedDecorator }
