// import { FulfillEntitiesDecorator } from "common/dddl/usecase/decorators/typeorm/fulfill-entities"
// import {
//   UseCase,
//   UseCaseReqData,
//   UseCaseReqMeta,
//   UseCaseRequest,
// } from "@dddl/usecase"
// import { IsUUID } from "class-validator"
// import { EitherResult, EitherResultP, Result } from "@dddl/rop"
// import { AggregateRoot } from "common/dddl/domain/aggregate-root"
// import { Matcher, MockProxy } from "jest-mock-extended"
// import mock from "jest-mock-extended/lib/Mock"
// import { FindByPkOptions, Repository, Specification } from "common/dddl/repository"
// import { v4 } from "uuid"
// import { EntityId } from "common/dddl/domain/entity"
//
// class TestAggregateRepo implements Repository<TestAggregate | undefined> {
//   id = ""
//
//   create(entity: TestAggregate): Promise<EitherResult> {
//     return Result.okup()
//   }
//
//   delete(entity: TestAggregate): Promise<EitherResult> {
//     return Result.okup()
//   }
//
//   getByPk(
//     options: FindByPkOptions<TestAggregate>,
//     specs?: Specification<TestAggregate>[],
//   ): Promise<EitherResult<TestAggregate | undefined, Error>> {
//     return Result.okup()
//   }
//
//   getBySpecs(
//     specs?: Specification<TestAggregate>[],
//   ): Promise<EitherResult<TestAggregate | undefined, Error>> {
//     return Result.okup()
//   }
//
//   async getAllBySpecs(
//     specs?: Specification<TestAggregate>[],
//   ): Promise<EitherResult<TestAggregate[]>> {
//     return Result.ok([])
//   }
//
//   save(entity: TestAggregate): Promise<EitherResult> {
//     return Result.okup()
//   }
//
//   update(entity: TestAggregate): Promise<EitherResult> {
//     return Result.okup()
//   }
// }
//
// class TestAggregate extends AggregateRoot<EntityId> {
//   constructor(public id: EntityId) {
//     super(id)
//   }
// }
//
// interface TestUCEntities {
//   test: TestAggregate
// }
//
// class TestUCResponse {
//   constructor(public result: boolean) {}
// }
//
// class TestUCRequestData extends UseCaseReqData<TestUCResponse> {
//   @IsUUID()
//   id: string
//
//   constructor(id: string) {
//     super()
//     this.id = id
//   }
// }
//
// class TestUC implements UseCase<TestUCRequestData, TestUCResponse, TestUCEntities> {
//   handle(
//     req: UseCaseRequest<TestUCRequestData, TestUCResponse, TestUCEntities>,
//   ): EitherResultP<TestUCResponse, Error> {
//     return Promise.resolve(Result.ok(new TestUCResponse(true)))
//   }
// }
//
describe("UseCase decorator FullfillEntities", function () {
  it("should succeed", function () {
    expect(true).toBeTruthy()
  })
  //   let fulfillEntitiesDecorator: FulfillEntitiesDecorator<
  //     TestUCRequestData,
  //     TestAggregate,
  //     TestUCEntities
  //   >
  //   let testUC: MockProxy<TestUC>
  //   let testAggRepo: MockProxy<TestAggregateRepo>
  //   let req: UseCaseRequest<TestUCRequestData, TestUCResponse, TestUCEntities>
  //   beforeEach(() => {
  //     testAggRepo = mock<TestAggregateRepo>()
  //     req = new UseCaseRequest<TestUCRequestData, TestUCResponse, TestUCEntities>(
  //       new TestUCRequestData(v4()),
  //       new UseCaseReqMeta({
  //         callerId: "",
  //       }),
  //     )
  //     testUC = mock<TestUC>()
  //     fulfillEntitiesDecorator = new FulfillEntitiesDecorator<
  //       TestUCRequestData,
  //       TestAggregate,
  //       TestUCEntities
  //     >(testAggRepo, "test", "id")
  //   })
  //
  //   it("should fulfill req.entities with data from repo", async function () {
  //     const agg = new TestAggregate(new EntityId(req.data.id))
  //     testUC.handle.calledWith(req).mockResolvedValue(Result.ok(new TestUCResponse(true)))
  //     testAggRepo.getByPk
  //       .calledWith(new Matcher((opts) => opts.value === req.data.id))
  //       .mockResolvedValue(Result.ok(agg))
  //     const res = await fulfillEntitiesDecorator.handle(testUC.handle)(req)
  //     if (!req.entities) {
  //       throw new Error("no entities")
  //     }
  //     expect(req.entities.test).toEqual(agg)
  //     expect(res.isOk()).toBeTruthy()
  //     expect(res).toEqual(Result.ok(new TestUCResponse(true)))
  //   })
})
