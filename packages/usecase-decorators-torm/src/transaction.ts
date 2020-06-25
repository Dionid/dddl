// import { Connection, getConnection } from "typeorm"
// import { Inject, Service } from "typedi"
// import { v4 } from "uuid"
// import { WithManager, WITH_MANAGER_DI_TOKEN } from "../../../repository/typeorm"
// import { UseCaseDecorator, UseCaseHandle, UseCaseRequest } from "@dddl/usecase"
// import { EitherResultP, Result } from "@dddl/rop"
// import { InjectConnection } from "typeorm-typedi-extensions"
//
// @Service()
// export class TypeORMTransactionDecorator implements UseCaseDecorator<any, any, any> {
//   constructor(
//     @Inject(WITH_MANAGER_DI_TOKEN) private manager: WithManager,
//     @InjectConnection() private connection: Connection,
//   ) {}
//
//   handle(next: UseCaseHandle<any, any, any>): UseCaseHandle<any, any, any> {
//     return async (ctx: UseCaseRequest<any, any, any>): EitherResultP<any> => {
//       const queryRunner = this.connection.createQueryRunner()
//       await queryRunner.startTransaction()
//
//       // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
//       // @ts-ignore
//       queryRunner.manager.dsid = v4()
//       this.manager.manager = queryRunner.manager
//
//       try {
//         const res = await next(ctx)
//         if (res.isError()) {
//           await queryRunner.rollbackTransaction()
//           return res
//         }
//         await queryRunner.commitTransaction()
//         return res
//       } catch (e) {
//         await queryRunner.rollbackTransaction()
//         return Result.ok(e)
//       } finally {
//         await queryRunner.release()
//       }
//     }
//   }
// }
