import { Inject, Service } from "typedi"
import { v4 } from "uuid"
import Knex from "knex"
import { UseCaseHandle, UseCaseRequest } from "@dddl/usecase"
import { EitherResultP, Result } from "@dddl/rop"
import {
  KNEX_CONNECTION_DI_TOKEN,
  TX_CONTAINER_DI_TOKEN,
  TxContainer,
} from "@dddl/dal-knex"
import { UseCaseDecorator } from "@dddl/usecase"

@Service()
export class KnexTransactionDecorator implements UseCaseDecorator<any, any, any> {
  constructor(
    @Inject(KNEX_CONNECTION_DI_TOKEN) private knex: Knex,
    @Inject(TX_CONTAINER_DI_TOKEN) private txContainer: TxContainer,
  ) {}

  handle(next: UseCaseHandle<any, any, any>): UseCaseHandle<any, any, any> {
    return async (ctx: UseCaseRequest<any, any, any>): EitherResultP<any> => {
      // If transactaion already exist than skip all checks
      if (this.txContainer.tx) {
        return await next(ctx)
      }
      this.txContainer.tx = await this.knex.transaction()
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      this.txContainer.tx._dsid = v4()

      try {
        const res = await next(ctx)
        if (res.isError()) {
          await this.txContainer.tx.rollback()
          return res
        }
        await this.txContainer.tx.commit()
        return res
      } catch (e) {
        await this.txContainer.tx.rollback()
        return Result.ok(e)
      } finally {
        // this.txContainer.tx.isCompleted()
      }
    }
  }
}
