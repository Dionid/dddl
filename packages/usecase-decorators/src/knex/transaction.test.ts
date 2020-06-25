describe("UseCase decorator Knex Transaction", function () {
  it("should succeed", function () {
    expect(true).toBeTruthy()
  })
  // let uc: MockProxy<UseCase<any, any, any>>
  // let req: UseCaseRequest<any, any, any>
  // let transactionDecorator: TypeORMTransactionDecorator
  // let withManager: WithManager
  // let connection = mock<Connection>()
  // let queryRunner = mock<QueryRunner>()
  //   //
  //   // beforeEach(() => {
  //   //   req = new UseCaseRequest<any, any, any>(
  //   //     v4(),
  //   //     new UseCaseReqMeta({
  //   //       callerId: v4(),
  //   //     }),
  //   //   )
  //   //   withManager = {
  //   //     manager: mock<EntityManager>()
  //   //   }
  //   //   queryRunner = mock<QueryRunner>()
  //   //   // queryRunner.manager = mock<EntityManager>()
  //   //   uc = mock<UseCase<any, any, any>>()
  //   //   connection = mock<Connection>()
  //   //   transactionDecorator = new TypeORMTransactionDecorator(
  //   //     withManager,
  //   //     connection,
  //   //   )
  //   // })
  //   //
  //   // it("should run transaction and commit if everything went successfully", function() {
  //   //   connection.createQueryRunner.calledWith().mockReturnValue(queryRunner)
  //   //   queryRunner.startTransaction.calledWith()
  //   //   eventBus.commit.calledWith()
  //   //   testUC.handle.calledWith(req).mockResolvedValue(Result.ok(true))
  //   //   const res = await transactionDecorator.handle(uc.handle)(req)
  //   //   expect(res.isOk()).toBeTruthy()
  //   //   expect(res).toEqual(Result.ok(true))
  //   //   expect(eventBus.withTx.mock.calls.length).toBe(1)
  //   //   expect(eventBus.commit.mock.calls.length).toBe(1)
  //   //   expect(eventBus.rollback.mock.calls.length).toBe(0)
  //   // })
})
