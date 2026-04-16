"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSpacerCall = parseSpacerCall;
var builders_1 = require("../../../ir/builders");
var shared_1 = require("../shared");
function parseSpacerCall(call, context) {
    var _a, _b;
    var labeledArgument = call.arguments.find(function (argument) { return argument.label === "minLength"; });
    var fallbackArgument = call.arguments[0];
    var candidateNode = (_b = (_a = labeledArgument === null || labeledArgument === void 0 ? void 0 : labeledArgument.value) !== null && _a !== void 0 ? _a : fallbackArgument === null || fallbackArgument === void 0 ? void 0 : fallbackArgument.value) !== null && _b !== void 0 ? _b : null;
    var minLength = candidateNode
        ? (0, shared_1.parseNumberLiteral)(candidateNode, context)
        : null;
    return (0, shared_1.withSourceRange)((0, builders_1.makeSpacer)(minLength), call.node);
}
