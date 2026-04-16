"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseTextCall = parseTextCall;
var builders_1 = require("../../../ir/builders");
var shared_1 = require("../shared");
function parseTextCall(call, context) {
    var _a, _b;
    var argumentNode = (_b = (_a = call.arguments[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : null;
    if (!argumentNode) {
        return (0, shared_1.withSourceRange)((0, builders_1.makeUnknown)("Text", (0, shared_1.getNodeText)(call.node, context)), call.node);
    }
    var parsedLiteral = (0, shared_1.parseStringLiteral)(argumentNode, context);
    if (!parsedLiteral) {
        return (0, shared_1.withSourceRange)((0, builders_1.makeUnknown)("Text", (0, shared_1.getNodeText)(call.node, context)), call.node);
    }
    return (0, shared_1.withSourceRange)((0, builders_1.makeText)(parsedLiteral.content, parsedLiteral.isDynamic), call.node);
}
