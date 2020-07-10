import { EitherResultP } from "@dddl/rop"

export interface FindByPkOptions<E> {
  value: string | number
}

export class Specification<Entity> {
  ent?: Entity
}

export interface Repository<Entity> {
  id: string
  getBySpecs(specs?: Specification<Entity>[]): EitherResultP<Entity | undefined>
  getByPk(
    options: FindByPkOptions<Entity>,
    specs?: Specification<Entity>[],
  ): EitherResultP<Entity | undefined>
  getAllBySpecs(specs: Specification<Entity>[]): EitherResultP<Entity[]>
  update(entity: Entity): EitherResultP
  create(entity: Entity): EitherResultP
  save(entity: Entity): EitherResultP
  delete(entity: Entity): EitherResultP
}

export interface RepositoryWithTx<Entity> extends Repository<Entity> {
  withTx(): EitherResultP
  commit(): EitherResultP
  rollback(): EitherResultP
}
