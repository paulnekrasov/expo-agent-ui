"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseVStackCall = parseVStackCall;
exports.parseHStackCall = parseHStackCall;
exports.parseZStackCall = parseZStackCall;
var builders_1 = require("../../../ir/builders");
var shared_1 = require("../shared");
function parseChildrenFromClosure(call, context, parseNestedView) {
    var lambdaNode = call.trailingClosures[0];
    if (!lambdaNode) {
        return [];
    }
    var statementsNode = (0, shared_1.getStatementsNodeFromLambda)(lambdaNode);
    if (!statementsNode) {
        return [];
    }
    return statementsNode.namedChildren
        .filter(function (child) {
        return child.type === "call_expression" || child.type === "if_statement";
    })
        .map(function (child) { return parseNestedView(child, context); });
}
function parseVStackCall(call, context, parseNestedView) {
    var _a;
    var alignmentArgument = call.arguments.find(function (argument) { return argument.label === "alignment"; });
    var spacingArgument = call.arguments.find(function (argument) { return argument.label === "spacing"; });
    var alignment = (_a = (alignmentArgument &&
        (0, shared_1.parseAlignmentValue)(alignmentArgument.value, context))) !== null && _a !== void 0 ? _a : "center";
    var spacing = spacingArgument
        ? (0, shared_1.parseNumberLiteral)(spacingArgument.value, context)
        : null;
    return (0, shared_1.withSourceRange)((0, builders_1.makeVStack)(alignment, spacing, parseChildrenFromClosure(call, context, parseNestedView)), call.node);
}
function parseHStackCall(call, context, parseNestedView) {
    var _a;
    var alignmentArgument = call.arguments.find(function (argument) { return argument.label === "alignment"; });
    var spacingArgument = call.arguments.find(function (argument) { return argument.label === "spacing"; });
    var alignment = (_a = (alignmentArgument &&
        (0, shared_1.parseAlignmentValue)(alignmentArgument.value, context))) !== null && _a !== void 0 ? _a : "center";
    var spacing = spacingArgument
        ? (0, shared_1.parseNumberLiteral)(spacingArgument.value, context)
        : null;
    return (0, shared_1.withSourceRange)((0, builders_1.makeHStack)(alignment, spacing, parseChildrenFromClosure(call, context, parseNestedView)), call.node);
}
function parseZStackCall(call, context, parseNestedView) {
    var _a;
    var alignmentArgument = call.arguments.find(function (argument) { return argument.label === "alignment"; });
    var alignment = (_a = (alignmentArgument &&
        (0, shared_1.parseAlignmentValue)(alignmentArgument.value, context))) !== null && _a !== void 0 ? _a : "center";
    return (0, shared_1.withSourceRange)((0, builders_1.makeZStack)(alignment, parseChildrenFromClosure(call, context, parseNestedView)), call.node);
}
