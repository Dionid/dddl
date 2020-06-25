"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyClassValidatorErrors = void 0;
const errorTransformer = (originErrorProp, err) => {
    const { constraints } = err;
    if (!constraints) {
        throw new Error("No constraints in error");
    }
    return {
        property: (originErrorProp + "." || originErrorProp) + err.property,
        errors: Object.keys(constraints).reduce((sum, cur) => {
            sum.push(constraints[cur]);
            return sum;
        }, []),
    };
};
const transformErrors = (originErrorProp, errors) => {
    return errors.reduce((sum, err) => {
        if (err.children && err.children.length) {
            return sum.concat(transformErrors(originErrorProp + err.property, err.children));
        }
        else {
            sum.push(errorTransformer(originErrorProp, err));
        }
        return sum;
    }, []);
};
const stringifyClassValidatorErrors = (errors) => {
    return JSON.stringify(transformErrors("", errors));
};
exports.stringifyClassValidatorErrors = stringifyClassValidatorErrors;
//# sourceMappingURL=classvalidatorErrors.js.map