"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionDenied = exports.UnauthorizedErr = exports.InvalidDataErr = exports.NotFoundErr = exports.NoEntitiesErr = exports.CriticalErr = exports.PublicErr = void 0;
class PublicErr extends Error {
    constructor(code, message, customCode, internalMessage) {
        super(message);
        this.code = code;
        this.customCode = customCode;
        this.internalMessage = internalMessage;
    }
    toString() {
        return JSON.stringify({
            message: this.message,
            code: this.code,
            customCode: this.customCode,
        });
    }
    toJSON() {
        return { message: this.message, code: this.code, customCode: this.customCode };
    }
}
exports.PublicErr = PublicErr;
class CriticalErr extends PublicErr {
    constructor(internalMessage) {
        super(500, "Internal server error", undefined, internalMessage);
        this.isCritical = true;
    }
}
exports.CriticalErr = CriticalErr;
class NoEntitiesErr extends CriticalErr {
    constructor(message) {
        super(message);
    }
}
exports.NoEntitiesErr = NoEntitiesErr;
class NotFoundErr extends PublicErr {
    constructor(message, customCode, internalMessage) {
        super(404, message, customCode, internalMessage);
    }
}
exports.NotFoundErr = NotFoundErr;
class InvalidDataErr extends PublicErr {
    constructor(message, customCode, internalMessage) {
        super(400, message, customCode, internalMessage);
    }
}
exports.InvalidDataErr = InvalidDataErr;
class UnauthorizedErr extends PublicErr {
    constructor(message, customCode, internalMessage) {
        super(401, message, customCode, internalMessage);
    }
}
exports.UnauthorizedErr = UnauthorizedErr;
class PermissionDenied extends PublicErr {
    constructor(message, customCode, internalMessage) {
        super(403, message, customCode, internalMessage);
        this.message = message || "Permission denied";
    }
}
exports.PermissionDenied = PermissionDenied;
//# sourceMappingURL=index.js.map