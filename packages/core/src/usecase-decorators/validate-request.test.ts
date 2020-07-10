import { ValidateRequestDecorator } from "./validate-request"
import { UseCase, UseCaseReqData, UseCaseReqMeta, UseCaseRequest } from "../usecase"
import { EitherResultP, Result } from "../rop"
import { IsEmail } from "class-validator"
import { mock, MockProxy } from "jest-mock-extended"

class TestUCResponse {
  constructor(public result: boolean) {}
}

class TestUCRequestData extends UseCaseReqData<TestUCResponse> {
  @IsEmail()
  email: string

  constructor(email: string) {
    super()
    this.email = email
  }
}

class TestUC implements UseCase<TestUCRequestData, TestUCResponse> {
  handle(
    req: UseCaseRequest<TestUCRequestData, TestUCResponse>,
  ): EitherResultP<TestUCResponse, Error> {
    return Promise.resolve(Result.ok(new TestUCResponse(true)))
  }
}

describe("UseCase decorator for Validating Input / Requests", function () {
  let validateRequestDecorator: ValidateRequestDecorator
  let testUC: MockProxy<TestUC>
  let req: UseCaseRequest<TestUCRequestData, TestUCResponse>

  beforeEach(() => {
    req = new UseCaseRequest<TestUCRequestData, TestUCResponse>(
      new TestUCRequestData("test@mail.ru"),
      new UseCaseReqMeta({
        callerId: "",
      }),
      {},
    )
    testUC = mock<TestUC>()
    validateRequestDecorator = new ValidateRequestDecorator()
  })

  it("should call next fn if validation success", async function () {
    testUC.handle.calledWith(req).mockResolvedValue(Result.ok(new TestUCResponse(true)))
    const res = await validateRequestDecorator.handle(testUC.handle)(req)
    expect(res.isOk()).toBeTruthy()
    expect(res).toEqual(Result.ok(new TestUCResponse(true)))
    expect(testUC.handle.mock.calls.length).toEqual(1)
  })

  it("should not call next fn if validation success", async function () {
    req.data.email = "shit.ru"
    testUC.handle.calledWith(req).mockResolvedValue(Result.ok(new TestUCResponse(true)))
    const res = await validateRequestDecorator.handle(testUC.handle)(req)
    expect(res.isError()).toBeTruthy()
    expect(testUC.handle.mock.calls.length).toEqual(0)
    // expect(res).toEqual(Result.fail(new InvalidDataErr()))
  })
})
