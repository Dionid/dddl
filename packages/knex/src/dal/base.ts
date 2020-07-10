import Knex from "knex"
import { Service } from "typedi"
import { EitherResultP, Result } from "@dddl/core/dist/rop"
import { CriticalErr } from "@dddl/core/dist/errors"
import { FindByPkOptions, RepositoryWithTx, Specification } from "@dddl/core/dist/dal"

interface SpecMapperInstance {}

export interface SpecMapper<Aggregate, Model> {
  new (): SpecMapperInstance
  map(
    query: Knex.QueryBuilder<Model>,
    specs: Specification<Aggregate>[],
  ): Knex.QueryBuilder<Model>
}

interface AggregateMapperInstance {}

export interface AggregateMapper<Aggregate, Model> {
  new (): AggregateMapperInstance
  to(model: Model): EitherResultP<Aggregate>
  from(aggregate: Aggregate): EitherResultP<Model>
}

export interface KnexRepository<AG> extends RepositoryWithTx<AG> {}

@Service()
export class TxContainer {
  constructor(public tx: Knex.Transaction | null = null) {}
}

export class KnexRepositoryBase<
  Aggregate extends { getStringId(): string; isTransient: boolean },
  AggregateState,
  ID,
  Model
> implements KnexRepository<Aggregate> {
  constructor(
    public id: string,
    protected knex: Knex,
    protected tableName: string,
    protected pkName: string,
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
      await this.executer(this.tableName)
        .where({
          [this.pkName]: aggregate.getStringId(),
        })
        .update(modifiedModelRes.value)
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
      await this.executer(this.tableName).insert(modifiedModelRes.value)
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
      await this.executer<Model>(this.tableName)
        .where({
          [this.pkName]: aggregate.getStringId(),
        })
        .delete()
      return Result.oku()
    } catch (e) {
      return Result.error(e)
    }
  }

  protected async getAll(
    query: Knex.QueryBuilder<Model, Model[]>,
  ): EitherResultP<Aggregate[]> {
    try {
      const models = await query.select()
      const aggregates: Aggregate[] = []
      for (let i = 0; i < models.length; i++) {
        const model = models[i]
        const aggregateRes = await this.aggregateMapper.to(model)
        if (aggregateRes.isError()) {
          return Result.error(aggregateRes.error)
        }
        aggregateRes.value.isTransient = false
        aggregates.push(aggregateRes.value)
      }
      return Result.ok(aggregates)
    } catch (e) {
      return Result.error(e)
    }
  }

  protected async getOne(
    query: Knex.QueryBuilder<Model, Model>,
  ): EitherResultP<Aggregate | undefined> {
    try {
      const model = await query.first()
      if (!model) {
        return Result.oku()
      }
      const aggregateRes = await this.aggregateMapper.to(model)
      if (aggregateRes.isError()) {
        return Result.error(aggregateRes.error)
      }
      aggregateRes.value.isTransient = false
      return Result.ok(aggregateRes.value)
    } catch (e) {
      return Result.error(e)
    }
  }

  async getBySpecs(
    specs: Specification<Aggregate>[],
  ): EitherResultP<Aggregate | undefined> {
    const query = this.executer<Model, Model>(this.tableName)
    this.specMapper.map(query, specs)
    return this.getOne(query)
  }

  async getAllBySpecs(specs: Specification<Aggregate>[]): EitherResultP<Aggregate[]> {
    const query = this.executer<Model, Model[]>(this.tableName)
    this.specMapper.map(query, specs)
    return this.getAll(query)
  }

  async getByPk(
    options: FindByPkOptions<Aggregate>,
  ): EitherResultP<Aggregate | undefined> {
    const query = this.executer<Model, Model>(this.tableName).where({
      [this.pkName]: options.value,
    })
    return this.getOne(query)
  }
}

export const TX_CONTAINER_DI_TOKEN = "TX_CONTAINER_DI_TOKEN"
export const KNEX_CONNECTION_DI_TOKEN = "KNEX_CONNECTION_DI_TOKEN"
