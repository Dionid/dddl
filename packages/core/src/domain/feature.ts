import { ServiceObject } from "@dddl/serviceobject"
import { EitherResultP } from "@dddl/rop"

export class DomainFeatureReq<R> {
  private result?: R
}

export interface DomainFeature<Req extends DomainFeatureReq<Res>, Res>
  extends ServiceObject<EitherResultP<Res>> {
  can(req: Req): EitherResultP
  handle(req: Req): EitherResultP<Res>
}
