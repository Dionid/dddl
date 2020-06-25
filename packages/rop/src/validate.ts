import { stringifyClassValidatorErrors } from "@dddl/common"
import { InvalidDataErr } from "@dddl/errors"
import { validate, ValidatorOptions } from "class-validator"
import { EitherResultP, Result } from "./result"

export const validateResult = async (
  dto: any,
  validatorOptions?: ValidatorOptions,
): EitherResultP<undefined, InvalidDataErr> => {
  const errors = await validate(dto, validatorOptions)
  if (errors && errors.length) {
    return Result.error(new InvalidDataErr(stringifyClassValidatorErrors(errors)))
  }
  return Result.ok(undefined)
}
