import { Service } from "typedi"
import { UseCaseHandle, UseCaseRequest } from "../../usecase/src"
import { EitherResultP, validateResult } from "packages/rop/dist"
import { UseCaseDecorator } from "../../usecase/src"

@Service({ global: true })
export class ValidateRequestDecorator implements UseCaseDecorator<any, any, any> {
  handle(next: UseCaseHandle<any, any, any>): UseCaseHandle<any, any, any> {
    return async (req: UseCaseRequest<any, any, any>): EitherResultP<any> => {
      const err = await validateResult(req)
      if (err.isError()) {
        return err
      }
      return next(req)
    }
  }
}
