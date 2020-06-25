import { MockProxy } from "jest-mock-extended"
import { UseCase, UseCaseReqMeta, UseCaseRequest } from "../../usecase/src"
import { v4 } from "uuid"
import { Result } from "packages/rop/dist"
import mock from "jest-mock-extended/lib/Mock"
import { UnauthorizedErr } from "@dddl/errors"
import { AuthenticatedDecorator } from "./authenticated"

describe("UseCase Authenticated decorator", function () {
  let authenticatedDecorator: AuthenticatedDecorator
  let uc: MockProxy<UseCase<any, any, any>>
  let req: UseCaseRequest<any, any, any>

  beforeEach(() => {
    req = new UseCaseRequest<any, any>(
      v4(),
      new UseCaseReqMeta({
        callerId: v4(),
      }),
      {},
    )
    uc = mock<UseCase<any, any, any>>()
    authenticatedDecorator = new AuthenticatedDecorator()
  })

  it("should run UseCase if callerId has been set", async function () {
    uc.handle.calledWith(req).mockResolvedValue(Result.ok(true))
    const res = await authenticatedDecorator.handle(uc.handle)(req)
    expect(res.isOk()).toBeTruthy()
    expect(res).toEqual(Result.ok(true))
  })

  it("should run UseCase if callerId has been set", async function () {
    req.meta.callerId = ""
    uc.handle.calledWith(req).mockResolvedValue(Result.ok(true))
    const res = await authenticatedDecorator.handle(uc.handle)(req)
    expect(res.isError()).toBeTruthy()
    expect(res).toEqual(Result.error(new UnauthorizedErr()))
  })
})
