import { Validator } from "class-validator"

export type Constructor<T> = new (...args: any[]) => T

export declare type ClassDecorator = <TFunction extends Function>(
  target: TFunction,
) => TFunction | void
export declare type TypeClassDecorator<T> = <TFunction extends T>(
  target: TFunction,
) => TFunction | void
export declare type PropertyDecorator = (
  target: Record<string, any>,
  propertyKey: string | symbol,
) => void
export declare type MethodDecorator = <T>(
  target: Record<string, any>,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>,
) => TypedPropertyDescriptor<T> | void
export declare type ParameterDecorator = (
  target: Record<string, any>,
  propertyKey: string | symbol,
  parameterIndex: number,
) => void

export const validator = new Validator()
export type Maybe<T> = T | null

export type Modify<T, R> = Omit<T, keyof R> & R
export type OmitAndModify<T, S, R> = Omit<Omit<T, keyof S>, keyof R> & R
