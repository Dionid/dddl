import { Constructor, TypeClassDecorator } from "@dddl/common"
import { EitherResultP } from "@dddl/rop"
import { Container } from "typedi"
import { UseCase, UseCaseHandle, UseCaseReqData, UseCaseRequest } from "./main"

export const getContainerInstanceIdFromReq = (req: UseCaseRequest<any, any, any>) => {
  return req.meta.transactionId
}
export type UseCaseDecoratorHandle<Data extends UseCaseReqData<Res>, Res, Ctx> = (
  next: UseCaseHandle<Data, Res, Ctx>,
) => UseCaseHandle<Data, Res, Ctx>

export interface UseCaseDecorator<Data extends UseCaseReqData<Res>, Res, Ctx> {
  handle(next: UseCaseHandle<any, any, any>): UseCaseHandle<Data, Res, Ctx>
}

export const UseUCDClass = <Data, Res, Ctx, Dec extends UseCaseDecorator<Data, Res, Ctx>>(
  decoratorConstruct: Constructor<Dec> | Dec,
): TypeClassDecorator<Constructor<UseCase<Data, Res, Ctx>>> => {
  return <T extends Constructor<UseCase<Data, Res, Ctx>>>(target: T) => {
    return class extends target {
      constructor(...props: any[]) {
        super(...props)
      }

      async handle(req: UseCaseRequest<Data, Res, Ctx>): EitherResultP<Res> {
        let decorator: Dec
        if (typeof decoratorConstruct === "function") {
          decorator = Container.of(getContainerInstanceIdFromReq(req)).get<Dec>(
            decoratorConstruct,
          )
        } else {
          decorator = decoratorConstruct
        }
        return decorator.handle(super.handle.bind(this))(req)
      }
    }
  }
}
export const UseUCDMethod = <Dec extends UseCaseDecorator<any, any, any>>(
  decoratorConstruct: Constructor<Dec> | Dec,
) => {
  return (
    target: Record<string, any>,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<UseCaseHandle<any, any, any>>,
  ) => {
    const method = descriptor.value
    descriptor.value = function (req: UseCaseRequest<any, any, any>): EitherResultP<any> {
      let decorator: Dec
      if (typeof decoratorConstruct === "function") {
        decorator = Container.of(getContainerInstanceIdFromReq(req)).get<Dec>(
          decoratorConstruct,
        )
      } else {
        decorator = decoratorConstruct
      }
      return decorator.handle(method!.bind(this))(req)
    }
    return descriptor
  }
}
export const UseUCD = <Dec extends UseCaseDecorator<any, any, any>>(
  decoratorConstruct: Constructor<Dec> | Dec,
) => {
  return (...args: any) => {
    if (args.length === 3) {
      return UseUCDMethod(decoratorConstruct)(args[0], args[1], args[2])
    } else if (args.length === 1) {
      return UseUCDClass(decoratorConstruct)(args[0])
    } else {
      // invalid size of arguments
      throw new Error("Not a valid decorator")
    }
  }
}

export class IoCUCDecorator<
  UC extends UseCase<any, any, any>,
  CUC extends Constructor<UC>
> implements UseCase<any, any, any> {
  constructor(private uc: CUC) {}

  handle = async (req: UseCaseRequest<any, any, any>): EitherResultP<any> => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const existed = Container.instances.some(
      (cont: { id: string }) => cont.id === getContainerInstanceIdFromReq(req),
    )
    const cont = Container.of(getContainerInstanceIdFromReq(req))
    const uch = cont.get<UC>(this.uc)
    const response = await uch.handle(req)
    // You can't reset container if you didn't create it (is was existed on time of this call)
    if (!existed) Container.reset(getContainerInstanceIdFromReq(req))
    return response
  }
}
