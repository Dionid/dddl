import { KnexRepositoryBase } from "./base"
import { EitherResultP, Result } from "@dddl/core/dist/rop"
import { Constructor } from "@dddl/core/dist/common"

export const KnexRepositoryWithJsonColumnsMixin = <
  Aggregate extends { getStringId(): string; isTransient: boolean },
  AggregateState,
  ID,
  Model
>(
  jsonColNames: string[],
  KnexRepositoryBaseLikeClass: Constructor<
    KnexRepositoryBase<Aggregate, AggregateState, ID, Model>
  >,
): Constructor<KnexRepositoryBase<Aggregate, AggregateState, ID, Model>> => {
  return class extends KnexRepositoryBaseLikeClass {
    protected async stringifyJsonColumn(model: Model): Promise<Model> {
      for (const [key, val] of Object.entries(model)) {
        if (jsonColNames.some((jsonColName) => jsonColName === key)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          model[key] = JSON.stringify(val)
        }
      }
      return model
    }

    protected async beforeUpdate(model: Model): EitherResultP<Model> {
      try {
        return super.beforeUpdate(await this.stringifyJsonColumn(model))
      } catch (e) {
        return Result.error(e)
      }
    }

    protected async beforeCreate(model: Model): EitherResultP<Model> {
      try {
        return super.beforeCreate(await this.stringifyJsonColumn(model))
      } catch (e) {
        return Result.error(e)
      }
    }
  }
}
