// import { EntityManager, FindOneOptions } from "typeorm"
// import { FindByPkOptions, Repository, Specification } from "common/dddl/repository/index"
// import { v4 } from "uuid"
// import { EitherResultP, Result } from "@dddl/rop"
//
// export interface TORMRepository<E> extends Repository<E> {
//   findOne(options?: FindOneOptions<E>): EitherResultP<E | undefined>
// }
//
// export type SpecificationTORMResult<Entity> = (
//   opts: FindOneOptions<Entity>,
// ) => FindOneOptions<Entity>
//
// export interface SpecificationTORM<Entity> extends Specification {
//   apply<Options>(x: Options): SpecificationTORMResult<Entity>
// }
//
// export class TORMRepositoryBase<E> implements TORMRepository<E> {
//   public id: string
//   protected relations: string[] = []
//
//   constructor(
//     protected withManager: WithManager,
//     protected entityClass: { new (...any: any): E },
//   ) {
//     this.id = v4()
//   }
//
//   get manager(): EntityManager {
//     return this.withManager.manager
//   }
//
//   set manager(manager: EntityManager) {
//     this.withManager.manager = manager
//   }
//
//   withTx(manager: EntityManager) {
//     this.manager = manager
//   }
//
//   async findOne(options?: FindOneOptions<E>): EitherResultP<E | undefined> {
//     try {
//       const entity = await this.manager.findOne(this.entityClass, {
//         ...options,
//         relations: this.relations,
//       })
//       return Result.ok(entity)
//     } catch (e) {
//       return Result.fail(e)
//     }
//   }
//
//   async getBySpecs<Options>(
//     specs?: SpecificationTORMResult<E>[],
//   ): EitherResultP<E | undefined> {
//     try {
//       let searchOptions: FindOneOptions<E> = {}
//       if (specs) {
//         searchOptions = specs.reduce((sum, cur) => {
//           return cur(sum)
//         }, searchOptions)
//       }
//       return await this.findOne(searchOptions)
//     } catch (e) {
//       return Result.fail(e)
//     }
//   }
//
//   async getByPk(
//     options: FindByPkOptions<E>,
//     specs?: SpecificationTORMResult<E>[],
//   ): EitherResultP<E | undefined> {
//     try {
//       const pkName = "id"
//       let searchOptions: FindOneOptions<E> = {
//         where: {
//           [pkName]: options.value,
//         },
//       }
//       if (specs) {
//         searchOptions = specs.reduce((sum, cur) => {
//           return cur(sum)
//         }, searchOptions)
//       }
//       return await this.findOne(searchOptions)
//     } catch (e) {
//       return Result.fail(e)
//     }
//   }
//
//   async update(entity: E): EitherResultP {
//     try {
//       await this.manager.save(this.entityClass, entity)
//       return Result.oku()
//     } catch (e) {
//       return Result.fail(e)
//     }
//   }
//
//   async create(entity: E): EitherResultP {
//     try {
//       await this.manager.insert(this.entityClass, entity)
//       return Result.oku()
//     } catch (e) {
//       return Result.fail(e)
//     }
//   }
//
//   async save(entity: E): EitherResultP {
//     try {
//       await this.manager.save(this.entityClass, entity)
//       return Result.oku()
//     } catch (e) {
//       return Result.fail(e)
//     }
//   }
//
//   async delete(entity: E): EitherResultP {
//     try {
//       await this.manager.softRemove(this.entityClass, entity)
//       return Result.oku()
//     } catch (e) {
//       return Result.fail(e)
//     }
//   }
// }
//
// export interface WithManager {
//   manager: EntityManager
// }
//
// export const WITH_MANAGER_DI_TOKEN = "TYPEORM_WITH_MANAGER_DI_TOKEN"
