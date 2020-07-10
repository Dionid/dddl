import { ServiceObject } from "@dddl/serviceobject"
import { EitherResultP } from "@dddl/rop"
import { v4 } from "uuid"
import { IsOptional, IsUUID, ValidateNested } from "class-validator"

export class UseCaseReqMeta {
  private isUseCaseReqMeta = true

  @IsOptional()
  public callerId?: string
  @IsUUID()
  public transactionId: string
  @IsUUID()
  @IsOptional()
  public originTransactionId?: string
  constructor({
    callerId,
    originTransactionId,
    transactionId,
  }: {
    callerId?: string
    originTransactionId?: string
    transactionId?: string
  }) {
    this.callerId = callerId
    this.transactionId = transactionId || v4()
    this.originTransactionId = originTransactionId
  }
}

export class UseCaseReqData<R> {
  private result?: R
}

export interface UseCaseReqCtx {
  [key: string]: any
}

export interface UseCaseReqCtxWithEntities<Entities> extends UseCaseReqCtx {
  entities: Entities
}

export class UseCaseRequest<
  Data extends UseCaseReqData<Res>,
  Res,
  Ctx extends UseCaseReqCtx = Record<any, any>
> {
  @ValidateNested()
  public data: Data

  constructor(data: Data, public meta: UseCaseReqMeta, public ctx: Ctx) {
    this.data = data
  }
}

// TODO. Check difference
// export type UseCaseHandle<Data extends UseCaseReqData<Res>, Res, Ctx> = (
//   req: UseCaseRequest<Data, Res, Ctx>,
// ) => EitherResultP<Res>

export interface UseCaseHandle<
  Data extends UseCaseReqData<Res>,
  Res,
  Ctx extends UseCaseReqCtx = Record<any, any>
> {
  (req: UseCaseRequest<Data, Res, Ctx>): EitherResultP<Res>
}

export interface UseCase<
  Data extends UseCaseReqData<Res>,
  Res,
  Ctx extends UseCaseReqCtx = Record<any, any>
> extends ServiceObject<EitherResultP<Res>> {
  handle(req: UseCaseRequest<Data, Res, Ctx>): EitherResultP<Res>
}
