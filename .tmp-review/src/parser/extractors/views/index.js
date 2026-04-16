"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseViewNode = parseViewNode;
exports.parseViewNodesFromStatements = parseViewNodesFromStatements;
exports.parseViewBuilderBody = parseViewBuilderBody;
var builders_1 = require("../../../ir/builders");
var coreModifiers_1 = require("../modifiers/coreModifiers");
var shared_1 = require("../shared");
var button_1 = require("./button");
var image_1 = require("./image");
var spacer_1 = require("./spacer");
var stacks_1 = require("./stacks");
var text_1 = require("./text");
function isModifierCall(call) {
    if (call.callee.type !== "navigation_expression") {
        return false;
    }
    var target = call.callee.childForFieldName("target");
    return (target === null || target === void 0 ? void 0 : target.type) === "call_expression";
}
function unwindModifierChain(node, context) {
    var pendingModifiers = [];
    var currentNode = node;
    while (currentNode.type === "call_expression") {
        var call = (0, shared_1.parseCallDetails)(currentNode, context);
        if (!isModifierCall(call)) {
            break;
        }
        var targetNode = call.callee.childForFieldName("target");
        var suffixNode = call.callee.childForFieldName("suffix");
        if (!targetNode || !suffixNode) {
            break;
        }
        pendingModifiers.push({
            name: (0, shared_1.getLastPathComponent)((0, shared_1.getNavigationPath)(suffixNode, context)),
            call: call,
            node: currentNode,
        });
        currentNode = targetNode;
    }
    pendingModifiers.reverse();
    return {
        baseCall: currentNode,
        modifiers: pendingModifiers,
    };
}
function applyModifiers(view, modifiers, context) {
    if (modifiers.length === 0) {
        return view;
    }
    var parsedModifiers = modifiers.map(function (modifier) {
        return (0, coreModifiers_1.parseCoreModifier)(modifier.name, modifier.call, context, parseViewNode);
    });
    return __assign(__assign({}, view), { modifiers: __spreadArray(__spreadArray([], view.modifiers, true), parsedModifiers, true) });
}
function parsePrimitiveArgument(node, context) {
    var parsedString = (0, shared_1.parseStringLiteral)(node, context);
    if (parsedString) {
        return parsedString.content;
    }
    var numeric = (0, shared_1.parseNumberLiteral)(node, context);
    if (numeric !== null) {
        return numeric;
    }
    var booleanValue = (0, shared_1.parseBooleanLiteral)(node, context);
    if (booleanValue !== null) {
        return booleanValue;
    }
    return (0, shared_1.getNodeText)(node, context);
}
function parseCustomViewCall(call, context) {
    var args = {};
    call.arguments.forEach(function (argument, index) {
        var _a;
        var key = (_a = argument.label) !== null && _a !== void 0 ? _a : "arg".concat(index);
        args[key] = parsePrimitiveArgument(argument.value, context);
    });
    return (0, shared_1.withSourceRange)((0, builders_1.makeCustomView)(call.calleeName, args), call.node);
}
function wrapBuilderChildren(children, syntaxNode) {
    var _a;
    if (children.length === 0) {
        return (0, shared_1.withSourceRange)((0, builders_1.makeGroup)([]), syntaxNode);
    }
    if (children.length === 1) {
        return (_a = children[0]) !== null && _a !== void 0 ? _a : (0, shared_1.withSourceRange)((0, builders_1.makeGroup)([]), syntaxNode);
    }
    return (0, shared_1.withSourceRange)((0, builders_1.makeGroup)(children), syntaxNode);
}
function parseIfStatement(node, context) {
    var _a, _b, _c;
    var conditionNode = node.childForFieldName("condition");
    var statementsNodes = node.namedChildren.filter(function (child) { return child.type === "statements"; });
    var literalCondition = conditionNode
        ? (0, shared_1.parseBooleanLiteral)(conditionNode, context)
        : null;
    if (literalCondition === true) {
        return wrapBuilderChildren(parseViewNodesFromStatements((_a = statementsNodes[0]) !== null && _a !== void 0 ? _a : null, context), node);
    }
    if (literalCondition === false) {
        return wrapBuilderChildren(parseViewNodesFromStatements((_b = statementsNodes[1]) !== null && _b !== void 0 ? _b : null, context), node);
    }
    return wrapBuilderChildren(parseViewNodesFromStatements((_c = statementsNodes[1]) !== null && _c !== void 0 ? _c : null, context), node);
}
function parseKnownViewCall(call, context) {
    switch (call.calleeName) {
        case "VStack":
            return (0, stacks_1.parseVStackCall)(call, context, parseViewNode);
        case "HStack":
            return (0, stacks_1.parseHStackCall)(call, context, parseViewNode);
        case "ZStack":
            return (0, stacks_1.parseZStackCall)(call, context, parseViewNode);
        case "Text":
            return (0, text_1.parseTextCall)(call, context);
        case "Button":
            return (0, button_1.parseButtonCall)(call, context, parseViewNode);
        case "Image":
            return (0, image_1.parseImageCall)(call, context);
        case "Spacer":
            return (0, spacer_1.parseSpacerCall)(call, context);
        default:
            return (0, shared_1.withSourceRange)((0, builders_1.makeUnknown)(call.calleeName, (0, shared_1.getNodeText)(call.node, context)), call.node);
    }
}
function looksLikeCustomView(name) {
    return /^[A-Z]/.test(name);
}
function parseBaseCall(call, context) {
    switch (call.calleeName) {
        case "VStack":
        case "HStack":
        case "ZStack":
        case "Text":
        case "Button":
        case "Image":
        case "Spacer":
            return parseKnownViewCall(call, context);
        default:
            if (looksLikeCustomView(call.calleeName)) {
                return parseCustomViewCall(call, context);
            }
            return (0, shared_1.withSourceRange)((0, builders_1.makeUnknown)(call.calleeName, (0, shared_1.getNodeText)(call.node, context)), call.node);
    }
}
function parseCallExpression(node, context) {
    var _a = unwindModifierChain(node, context), baseCall = _a.baseCall, modifiers = _a.modifiers;
    var call = (0, shared_1.parseCallDetails)(baseCall, context);
    var baseView = parseBaseCall(call, context);
    return applyModifiers(baseView, modifiers, context);
}
function parseViewNode(node, context) {
    try {
        switch (node.type) {
            case "call_expression":
                return parseCallExpression(node, context);
            case "if_statement":
                return parseIfStatement(node, context);
            default:
                return (0, shared_1.withSourceRange)((0, builders_1.makeUnknown)(node.type, (0, shared_1.getNodeText)(node, context)), node);
        }
    }
    catch (_a) {
        return (0, shared_1.withSourceRange)((0, builders_1.makeUnknown)(node.type, (0, shared_1.getNodeText)(node, context)), node);
    }
}
function parseViewNodesFromStatements(statementsNode, context) {
    if (!statementsNode) {
        return [];
    }
    return statementsNode.namedChildren
        .filter(function (child) {
        return child.type === "call_expression" || child.type === "if_statement";
    })
        .map(function (child) { return parseViewNode(child, context); });
}
function parseViewBuilderBody(lambdaNode, context) {
    return parseViewNodesFromStatements((0, shared_1.getStatementsNodeFromLambda)(lambdaNode), context);
}
