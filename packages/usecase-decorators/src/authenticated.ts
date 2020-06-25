import { Service } from "typedi"
import { UseCaseHandle, UseCaseRequest } from "../../usecase/src"
import { EitherResultP, Result } from "packages/rop/dist"
import { UnauthorizedErr } from "@dddl/errors"
import { UseCaseDecorator } from "../../usecase/src"

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
