"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseButtonCall = parseButtonCall;
var builders_1 = require("../../../ir/builders");
var shared_1 = require("../shared");
function parseButtonRole(call, context) {
    var roleArgument = call.arguments.find(function (argument) { return argument.label === "role"; });
    if (!roleArgument) {
        return null;
    }
    var roleName = (0, shared_1.getLastPathComponent)((0, shared_1.getNavigationPath)(roleArgument.value, context));
    if (roleName === "cancel" || roleName === "destructive") {
        return roleName;
    }
    return null;
}
function parseButtonLabelFromClosure(call, context, parseNestedView) {
    var labelClosure = call.trailingClosures[0];
    if (!labelClosure) {
        return null;
    }
    var statementsNode = (0, shared_1.getStatementsNodeFromLambda)(labelClosure);
    var firstViewNode = statementsNode === null || statementsNode === void 0 ? void 0 : statementsNode.namedChildren.find(function (child) {
        return child.type === "call_expression" || child.type === "if_statement";
    });
    return firstViewNode
        ? parseNestedView(firstViewNode, context)
        : null;
}
function parseButtonLabelFromString(call, context) {
    var titleArgument = call.arguments.find(function (argument) { return argument.label === null; });
    if (!titleArgument) {
        return null;
    }
    var parsedString = (0, shared_1.parseStringLiteral)(titleArgument.value, context);
    if (!parsedString) {
        return null;
    }
    return (0, builders_1.makeText)(parsedString.content, parsedString.isDynamic);
}
function parseButtonCall(call, context, parseNestedView) {
    var _a, _b;
    var label = (_b = (_a = parseButtonLabelFromClosure(call, context, parseNestedView)) !== null && _a !== void 0 ? _a : parseButtonLabelFromString(call, context)) !== null && _b !== void 0 ? _b : (0, builders_1.makeUnknown)("ButtonLabel", (0, shared_1.getNodeText)(call.node, context));
    var button = (0, builders_1.makeButton)(label);
    button.role = parseButtonRole(call, context);
    return (0, shared_1.withSourceRange)(button, call.node);
}
