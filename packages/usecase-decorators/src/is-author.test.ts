import { mock } from "jest-mock-extended"
import { IsAuthorDecorator, NotAuthorError } from "./is-author"
import { Result } from "@dddl/rop"
import {
  UseCase,
  UseCaseReqCtxWithEntities,
  UseCaseReqData,
  UseCaseReqMeta,
  UseCaseRequest,
} from "../index"

class TEntity {
  author_id!: string
}

interface CtxEntities {
  entity: TEntity
}

class Ctx extends UseCaseReqData<undefined> {}

class Req extends UseCaseRequest<
  Ctx,
  undefined,
  UseCaseReqCtxWithEntities<CtxEntities>
> {}

describe("Update Card by User Security", function () {
  let so: UseCase<Ctx, undefined, CtxEntities>
  let isAuthorSecurity: IsAuthorDecorator<
    { entities: CtxEntities },
    "entity",
    TEntity,
    "author_id"
  >

  let entity: TEntity

  beforeEach(() => {
    so = mock<UseCase<any, any, any>>()
    isAuthorSecurity = new IsAuthorDecorator("entity", "author_id")
    entity = new TEntity()
  })

  describe("with good ctx", function () {
    it("should fail if no card found", async function () {
      const ctx = new Ctx()
      const req = new Req(ctx, new UseCaseReqMeta({ callerId: "" }), {
        entities: {
          entity: new TEntity(),
        },
      })
      const res = await isAuthorSecurity.handle(async (ctx) => {
        return Result.oku()
      })(req)
      expect(res).toEqual(Result.error(NotAuthorError))
    })
    describe("that contains delta", function () {
      // it('should success', async function () {});
    })
  })
})
