import { Service } from "typedi"
import { UseCaseHandle, UseCaseRequest } from "../usecase"
import { EitherResultP, Result } from "../rop"
import { UnauthorizedErr } from "../errors"
import { UseCaseDecorator } from "../usecase"

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
