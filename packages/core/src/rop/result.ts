type Action<T, A> = (res: T) => EitherResultP<A>

export class Result {
  public static ok<T, E>(value: T): OkResult<T, E> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new OkResult(value)
  }

  public static okp<T, E>(value: T): Promise<OkResult<T, E>> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return Promise.resolve(new OkResult(value))
  }

  public static oku<E = Error>(): OkResult<undefined, E> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new OkResult(undefined)
  }

  public static okup<E = Error>(): Promise<OkResult<undefined, E>> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return Promise.resolve(new OkResult(undefined))
  }

  public static error<T, E>(error: E): ErrorResult<T, E> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return new ErrorResult(error)
  }

  public static errorp<T, E>(error: E): Promise<ErrorResult<T, E>> {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return Promise.resolve(new ErrorResult(error))
  }

  public static anyError(results: EitherResult<any, any>[]): EitherResult<any, any> {
    // const res = []
    for (const result of results) {
      if (result.isError()) return result
      // res.push(result.value)
    }
    return Result.oku()
  }

  public static combineError<E>(
    ...results: EitherResult<any, E>[]
  ): EitherResult<any, E[]> {
    const res = []
    for (const result of results) {
      if (result.isError()) {
        res.push(result.error)
      }
    }
    if (res.length) {
      return Result.error(res)
    }
    return Result.oku()
  }

  public static combineErrorAndFlat<E>(
    ...results: EitherResult<any, E[]>[]
  ): EitherResult<any, E[]> {
    let res: E[] = []
    for (const result of results) {
      if (result.isError()) {
        res = res.concat(result.error)
      }
    }
    if (res.length) {
      return Result.error(res)
    }
    return Result.oku()
  }

  public static async asyncChainNext<A, T>(
    firstAction: EitherResultP<A>,
    secondAction: Action<A, T>,
  ): EitherResultP<T> {
    const firstResult = await firstAction
    return firstResult.asyncAndThen(secondAction)
  }

  public static async asyncChain2<A, S>(
    firstAction: Action<undefined, A>,
    secondAction: Action<A, S>,
  ): EitherResultP<S> {
    const firstResult = await firstAction(undefined)
    return firstResult.asyncAndThen(secondAction)
  }

  public static async asyncChain3<A, S, R>(
    firstAction: Action<undefined, A>,
    secondAction: Action<A, S>,
    thirdAction: Action<S, R>,
  ): EitherResultP<R> {
    return this.asyncChainNext(this.asyncChain2(firstAction, secondAction), thirdAction)
  }
}

export class ErrorResult<T, E> {
  constructor(public readonly error: E) {}

  isOk(): this is OkResult<T, E> {
    return false
  }

  isError(): this is ErrorResult<T, E> {
    return true
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public map<A>(_fn: (val: T) => A): EitherResult<A, E> {
    return Result.error(this.error)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async asyncMap<U>(_f: (t: T) => Promise<U>): Promise<EitherResult<U, E>> {
    return Result.error(this.error)
  }

  public mapError<U>(fn: (val: E) => U): EitherResult<T, U> {
    return Result.error(fn(this.error))
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  andThen<U>(_f: (t: T) => EitherResult<U, E>): EitherResult<U, E> {
    return Result.error(this.error)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async asyncAndThen<U>(
    _f: (t: T) => Promise<EitherResult<U, E>>,
  ): Promise<EitherResult<U, E>> {
    return Result.error(this.error)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fork<A>(_map: (t: T) => A, mapErr: (e: E) => A): A {
    return mapErr(this.error)
  }

  returnUndefinedResult(): EitherResult<undefined, E> {
    return this.map(() => {
      return undefined
    })
  }
}

export class OkResult<T, E> {
  constructor(public readonly value: T) {}

  isOk(): this is OkResult<T, E> {
    return true
  }

  isError(): this is ErrorResult<T, E> {
    return false
  }

  public map<A>(fn: (val: T) => A): EitherResult<A, E> {
    return Result.ok(fn(this.value))
  }

  async asyncMap<U>(f: (t: T) => Promise<U>): Promise<EitherResult<U, E>> {
    const newInner = await f(this.value)

    return Result.ok(newInner)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public mapError<U>(_fn: (val: E) => U): EitherResult<T, U> {
    return Result.ok(this.value)
  }

  andThen<U>(f: (t: T) => EitherResult<U, E>): EitherResult<U, E> {
    return f(this.value)
  }

  async asyncAndThen<U>(f: (t: T) => EitherResultP<U, E>): EitherResultP<U, E> {
    return await f(this.value)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fork<A>(map: (t: T) => A, _mapErr: (e: E) => A): A {
    return map(this.value)
  }

  returnUndefinedResult(): EitherResult<undefined, E> {
    return this.map(() => {
      return undefined
    })
  }
}

export type EitherResult<T = undefined, E = Error | Error[]> =
  | ErrorResult<T, E>
  | OkResult<T, E>
export type EitherResultP<T = undefined, E = Error | Error[]> = Promise<
  EitherResult<T, E>
>
