// import { FindByPkOptions, Repository, Specification } from "common/dddl/repository"
// import {
//   UseCaseReqData,
//   UseCaseDecorator,
//   UseCaseHandle,
//   UseCaseRequest,
// } from "../index"
// import { Service } from "typedi"
// import { Maybe } from "@dddl/common"
// import { EitherResultP, Result } from "@dddl/rop"
//
// @Service()
// class FulfillEntitiesDecorator<D extends UseCaseReqData<any>, Entity, Entities>
//   implements UseCaseDecorator<D, any, { [key: string]: any }> {
//   constructor(
//     private repo: Repository<Entity>,
//     private entityName: keyof Entities,
//     private dataPkName: keyof D,
//     private pkName: string = "id",
//     private specs?: TORMSpecification<Entity>[],
//   ) {}
//
//   handle(next: UseCaseHandle<any, any, any>): UseCaseHandle<any, any, any> {
//     return async (
//       ctx: UseCaseRequest<any, any, Maybe<{ [key: string]: any }>>,
//     ): EitherResultP<any> => {
//       let options: FindByPkOptions<Entity> = {
//         value: ctx.data[this.dataPkName],
//       }
//       if (this.specs) {
//         for (let i = 0; i < this.specs.length; i++) {
//           options = this.specs[i](options)
//         }
//       }
//       const res = await this.repo.getByPk(options)
//       if (res.isError()) {
//         return res
//       }
//       const value = res.value
//       if (!value) {
//         return Result.fail(new Error("no entity"))
//       }
//
//       if (ctx.entities) {
//         ctx.entities = {
//           ...ctx.entities,
//           [this.entityName]: value,
//         }
//       } else {
//         ctx.entities = {
//           [this.entityName]: value,
//         }
//       }
//
//       return next(ctx)
//     }
//   }
// }
//
// export { FulfillEntitiesDecorator }
