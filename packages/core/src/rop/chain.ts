import { EitherResult, EitherResultP, Result } from "./result"

export class ResultChain<T, E> {
  constructor(private value: EitherResultP<T, E>) {}

  static empty(): ResultChain<undefined, Error | Error[]> {
    return new ResultChain(Promise.resolve(Result.oku()))
  }

  static of<T, E>(value: EitherResultP<T, E> | EitherResult<T, E>): ResultChain<T, E> {
    if (!(value instanceof Promise)) {
      return new ResultChain(Promise.resolve(value))
    }
    return new ResultChain(value)
  }

  map<M>(fn: (value: T) => EitherResultP<M, E> | EitherResult<M, E>): ResultChain<M, E> {
    return new ResultChain(
      this.value.then((value: EitherResult<T, E>) => {
        if (value.isError()) {
          return (value as unknown) as EitherResult<M, E>
        }
        return fn(value.value)
      }),
    )
  }

  mapFail<M>(
    fn: (value: E) => EitherResultP<T, M> | EitherResultP<T, M>,
  ): ResultChain<T, M> {
    return new ResultChain(
      this.value.then((value) => {
        if (value.isOk()) {
          return (value as unknown) as EitherResult<T, M>
        }
        return fn(value.error)
      }),
    )
  }

  fork<U, M>(
    map: (value: T) => EitherResultP<U, E> | EitherResult<U, E>,
    mapErr: (value: E) => EitherResultP<T, M> | EitherResultP<T, M>,
  ): ResultChain<U, M> {
    return new ResultChain(
      this.value.then((value) => {
        if (value.isOk()) {
          return (map(value.value) as unknown) as EitherResult<U, M>
        } else {
          return (mapErr(value.error) as unknown) as EitherResult<U, M>
        }
      }),
    )
  }

  inspect(fn: (value?: T, error?: E) => void): ResultChain<T, E> {
    return new ResultChain(
      this.value.then((value) => {
        if (value.isOk()) {
          fn(value.value)
        } else {
          fn(undefined, value.error)
        }
        return value
      }),
    )
  }

  returnValue(): EitherResultP<T, E> {
    return this.value
  }

  returnValueWith<U>(value: U): EitherResultP<U, E> {
    this.value.then((origVal) => {
      if (origVal.isError()) {
        return origVal
      }
      return Result.ok(value)
    })
    return (this.value as unknown) as EitherResultP<U, E>
  }

  returnUndefinedValue(): EitherResultP<undefined, E> {
    this.value.then((origVal) => {
      if (origVal.isError()) {
        return origVal
      }
      return undefined
    })
    return (this.value as unknown) as EitherResultP<undefined, E>
  }
}
