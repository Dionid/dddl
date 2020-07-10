import { ValidationError } from "class-validator"

type customErrObj = {
  property: string
  errors: string[]
}

const errorTransformer = (
  originErrorProp: string,
  err: ValidationError,
): customErrObj => {
  const { constraints } = err
  if (!constraints) {
    throw new Error("No constraints in error")
  }
  return {
    property: (originErrorProp + "." || originErrorProp) + err.property,
    errors: Object.keys(constraints).reduce<string[]>((sum, cur) => {
      sum.push(constraints[cur])
      return sum
    }, []),
  }
}

const transformErrors = (
  originErrorProp: string,
  errors: ValidationError[],
): customErrObj[] => {
  return errors.reduce<customErrObj[]>((sum, err) => {
    if (err.children && err.children.length) {
      return sum.concat(transformErrors(originErrorProp + err.property, err.children))
    } else {
      sum.push(errorTransformer(originErrorProp, err))
    }
    return sum
  }, [])
}

const stringifyClassValidatorErrors = (errors: ValidationError[]): string => {
  return JSON.stringify(transformErrors("", errors))
}

export { stringifyClassValidatorErrors }
