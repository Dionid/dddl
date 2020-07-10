import { shallowEqual } from "../common/shallow-equal-object"

export abstract class ValueObjectBase<T> {
  public readonly props: T

  protected constructor(props: T) {
    this.props = props
  }

  public equals(vo: MutableValueObject<T>): boolean {
    if (this === vo) {
      return true
    }

    return shallowEqual(this.props, vo.props)
  }
}

export abstract class ValueObject<T> extends ValueObjectBase<T> {
  public readonly props: T

  protected constructor(props: T) {
    super(props)
    this.props = Object.freeze(props)
  }
}

export abstract class MutableValueObject<T> extends ValueObjectBase<T> {
  public equals(vo: MutableValueObject<T>): boolean {
    return shallowEqual(this.props, vo.props)
  }
}
