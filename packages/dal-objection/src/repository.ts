import * as Knex from "knex"
import { FindByPkOptions, RepositoryWithTx, Specification } from "@dddl/dal"
import { EitherResultP, Result } from "@dddl/rop"
import { CriticalErr } from "@dddl/errors"
import {
  ModelClass,
  Model as ObjectionModel,
  QueryBuilderType
} from "objection"

interface SpecMapperInstance {}

export interface SpecMapper<Aggregate, Model extends ObjectionModel> {
  new (): SpecMapperInstance
  map(
    query: QueryBuilderType<Model>,
    specs: Specification<Aggregate>[],
  ): QueryBuilderType<Model>
}

interface AggregateMapperInstance {}

export interface AggregateMapper<Aggregate, Model extends ObjectionModel> {
  new (): AggregateMapperInstance
  to(model: Model): EitherResultP<Aggregate>
  from(aggregate: Aggregate): EitherResultP<Model>
}

export interface Repository<AG> extends RepositoryWithTx<AG> {}

export class TxContainer {
  constructor(public tx: Knex.Transaction | null = null) {}
}

export class ObjectionRepositoryBase<
  Aggregate extends { getStringId(): string; isTransient: boolean },
  AggregateState,
  ID,
  Model extends ObjectionModel
> implements Repository<Aggregate> {
  constructor(
    public id: string,
    protected knex: Knex,
    protected model: ModelClass<Model>,
    protected specMapper: SpecMapper<Aggregate, Model>,
    protected aggregateMapper: AggregateMapper<Aggregate, Model>,
    protected txContainer: TxContainer,
  ) {}

  public async withTx(): EitherResultP {
    // If already has transaction than skip
    if (this.txContainer.tx) return Result.oku()
    // If no transaction
    try {
      // Create new transaction
      this.txContainer.tx = await this.knex.transaction()
    } catch (e) {
      return Result.error(e)
    }
    return Result.oku()
  }

  public async commit(): EitherResultP {
    if (!this.txContainer.tx)
      return Result.error(new CriticalErr("Commit without transaction"))
    try {
      await this.txContainer.tx.commit()
    } catch (e) {
      return Result.error(e)
    }
    return Result.oku()
  }

  public async rollback(): EitherResultP {
    if (!this.txContainer.tx)
      return Result.error(new CriticalErr("Rollback without transaction"))
    try {
      await this.txContainer.tx.rollback()
    } catch (e) {
      return Result.error(e)
    }
    return Result.oku()
  }

  protected get executer(): Knex {
    if (this.txContainer.tx) {
      return this.txContainer.tx
    }
    return this.knex
  }

  protected async beforeUpdate(model: Model): EitherResultP<Model> {
    return Result.ok(model)
  }

  async update(aggregate: Aggregate): EitherResultP {
    try {
      const modelRes = await this.aggregateMapper.from(aggregate)
      if (modelRes.isError()) {
        return Result.error(modelRes.error)
      }
      const modifiedModelRes = await this.beforeUpdate(modelRes.value)
      if (modifiedModelRes.isError()) {
        return Result.error(modifiedModelRes.error)
      }
      await modifiedModelRes.value.$query(this.executer).update()
      return Result.oku()
    } catch (e) {
      return Result.error(e)
    }
  }

  protected async beforeCreate(model: Model): EitherResultP<Model> {
    return Result.ok(model)
  }

  async create(aggregate: Aggregate): EitherResultP {
    try {
      const modelRes = await this.aggregateMapper.from(aggregate)
      if (modelRes.isError()) {
        return Result.error(modelRes.error)
      }
      const modifiedModelRes = await this.beforeUpdate(modelRes.value)
      if (modifiedModelRes.isError()) {
        return Result.error(modifiedModelRes.error)
      }
      await modifiedModelRes.value.$query(this.executer).insert()
      aggregate.isTransient = false
      return Result.oku()
    } catch (e) {
      return Result.error(e)
    }
  }

  async save(aggregate: Aggregate): EitherResultP {
    if (aggregate.isTransient) {
      return this.create(aggregate)
    } else {
      return this.update(aggregate)
    }
  }

  async delete(aggregate: Aggregate): EitherResultP {
    try {
      if (aggregate.isTransient) {
        return Result.error(new Error("Can't delete transient aggregate"))
      }
      await this.model.query(this.executer).deleteById(aggregate.getStringId())
      return Result.oku()
    } catch (e) {
      return Result.error(e)
    }
  }

  protected async fromModelToAggregate(model: Model): EitherResultP<Aggregate> {
    const aggregateRes = await this.aggregateMapper.to(model)
    if (aggregateRes.isError()) {
      return Result.error(aggregateRes.error)
    }
    aggregateRes.value.isTransient = false
    return aggregateRes
  }

  protected async getAll(query: QueryBuilderType<Model>): EitherResultP<Aggregate[]> {
    try {
      const models = (await query) as Model[]
      const aggregates: Aggregate[] = []
      for (let i = 0; i < models.length; i++) {
        const model = models[i]
        const aggregateRes = await this.fromModelToAggregate(model)
        if (aggregateRes.isError()) {
          return Result.error(aggregateRes.error)
        }
        aggregates.push(aggregateRes.value)
      }
      return Result.ok(aggregates)
    } catch (e) {
      return Result.error(e)
    }
  }

  protected async getOne(
    query: QueryBuilderType<Model>,
  ): EitherResultP<Aggregate | undefined> {
    try {
      const model = (await query.first()) as Model
      if (!model) {
        return Result.oku()
      }
      return await this.fromModelToAggregate(model)
    } catch (e) {
      return Result.error(e)
    }
  }

  async getBySpecs(
    specs: Specification<Aggregate>[],
  ): EitherResultP<Aggregate | undefined> {
    const query = this.model.query(this.executer)
    this.specMapper.map(query, specs)
    return this.getOne(query)
  }

  async getAllBySpecs(specs: Specification<Aggregate>[]): EitherResultP<Aggregate[]> {
    const query: QueryBuilderType<Model> = this.model.query(this.executer)
    this.specMapper.map(query, specs)
    return this.getAll(query)
  }

  async getByPk(
    options: FindByPkOptions<Aggregate>,
  ): EitherResultP<Aggregate | undefined> {
    const model = (await this.model.query(this.executer).findById(options.value)) as Model
    return await this.fromModelToAggregate(model)
  }
}

export const OBJECTION_TX_CONTAINER_DI_TOKEN = "TX_CONTAINER_DI_TOKEN"
export const KNEX_CONNECTION_DI_TOKEN = "KNEX_CONNECTION_DI_TOKEN"
