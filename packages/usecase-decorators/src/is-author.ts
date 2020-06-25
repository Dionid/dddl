import { UseCaseHandle, UseCaseReqCtxWithEntities, UseCaseRequest } from "../index"
import { Service } from "typedi"
import { EitherResultP, Result } from "@dddl/rop"
import { PermissionDenied, CriticalErr } from "@dddl/errors"
import { UseCaseDecorator } from "../index"

const NotAuthorError = new PermissionDenied()

@Service()
class IsAuthorDecorator<
  Ctx extends UseCaseReqCtxWithEntities<{ [P in EntitiesName]: Entity }>,
  EntitiesName extends string,
  Entity extends { [P in EntityAuthPropName]: string },
  EntityAuthPropName extends string
> implements UseCaseDecorator<any, any, Ctx> {
  constructor(
    private entityName: EntitiesName,
    private entityNameAuthorityProp: EntityAuthPropName,
  ) {}

  handle(next: UseCaseHandle<any, any, Ctx>): UseCaseHandle<any, any, Ctx> {
    return async (req: UseCaseRequest<any, any, Ctx>): EitherResultP<any> => {
      const { entities } = req.ctx
      if (!entities) {
        return Result.error(
          new CriticalErr("No entities in IsAuthorDecorator: " + JSON.stringify(req)),
        )
      }

      if (entities[this.entityName][this.entityNameAuthorityProp] !== req.meta.callerId) {
        return Result.error(NotAuthorError)
      }

      return next(req)
    }
  }
}

export { IsAuthorDecorator, NotAuthorError }
