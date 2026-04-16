"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseImageCall = parseImageCall;
var builders_1 = require("../../../ir/builders");
var shared_1 = require("../shared");
function parseImageCall(call, context) {
    var _a, _b, _c, _d;
    var argumentNode = (_b = (_a = call.arguments[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : null;
    if (!argumentNode) {
        return (0, shared_1.withSourceRange)((0, builders_1.makeUnknown)("Image", (0, shared_1.getNodeText)(call.node, context)), call.node);
    }
    var parsedLiteral = (0, shared_1.parseStringLiteral)(argumentNode, context);
    if (!parsedLiteral) {
        return (0, shared_1.withSourceRange)((0, builders_1.makeUnknown)("Image", (0, shared_1.getNodeText)(call.node, context)), call.node);
    }
    var firstArgumentLabel = (_d = (_c = call.arguments[0]) === null || _c === void 0 ? void 0 : _c.label) !== null && _d !== void 0 ? _d : null;
    if (firstArgumentLabel === "systemName") {
        return (0, shared_1.withSourceRange)((0, builders_1.makeImage)({
            kind: "systemName",
            name: parsedLiteral.content,
        }), call.node);
    }
    return (0, shared_1.withSourceRange)((0, builders_1.makeImage)({
        kind: "named",
        name: parsedLiteral.content,
    }), call.node);
}
