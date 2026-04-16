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
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSwiftSource = normalizeSwiftSource;
exports.getNodeText = getNodeText;
exports.getSourceRange = getSourceRange;
exports.withSourceRange = withSourceRange;
exports.getFirstNamedChildByType = getFirstNamedChildByType;
exports.getNamedChildrenByType = getNamedChildrenByType;
exports.getStatementsNodeFromLambda = getStatementsNodeFromLambda;
exports.getStatementsNodeFromComputedProperty = getStatementsNodeFromComputedProperty;
exports.getNavigationPath = getNavigationPath;
exports.getLastPathComponent = getLastPathComponent;
exports.parseCallDetails = parseCallDetails;
exports.parseNumberLiteral = parseNumberLiteral;
exports.parseBooleanLiteral = parseBooleanLiteral;
exports.parseSizeValue = parseSizeValue;
exports.parseAlignmentValue = parseAlignmentValue;
exports.parseEdgeSet = parseEdgeSet;
exports.parseStringLiteral = parseStringLiteral;
function normalizeSwiftSource(source) {
    return source.replace(/\r\n/g, "\n");
}
function getNodeText(node, context) {
    return context.source.slice(node.startIndex, node.endIndex);
}
function getSourceRange(node) {
    return {
        start: node.startIndex,
        end: node.endIndex,
    };
}
function withSourceRange(node, syntaxNode) {
    return __assign(__assign({}, node), { sourceRange: getSourceRange(syntaxNode) });
}
function getFirstNamedChildByType(node, type) {
    for (var _i = 0, _a = node.namedChildren; _i < _a.length; _i++) {
        var child = _a[_i];
        if (child.type === type) {
            return child;
        }
    }
    return null;
}
function getNamedChildrenByType(node, type) {
    return node.namedChildren.filter(function (child) { return child.type === type; });
}
function getStatementsNodeFromLambda(lambdaNode) {
    return getFirstNamedChildByType(lambdaNode, "statements");
}
function getStatementsNodeFromComputedProperty(computedPropertyNode) {
    return getFirstNamedChildByType(computedPropertyNode, "statements");
}
function getNavigationPath(node, context) {
    switch (node.type) {
        case "simple_identifier":
        case "type_identifier":
        case "line_str_text":
            return getNodeText(node, context);
        case "prefix_expression": {
            var target = node.childForFieldName("target");
            return target ? getNavigationPath(target, context) : "";
        }
        case "navigation_expression": {
            var target = node.childForFieldName("target");
            var suffix = node.childForFieldName("suffix");
            var targetPath = target
                ? getNavigationPath(target, context)
                : "";
            var suffixPath = suffix
                ? getNavigationPath(suffix, context)
                : "";
            return targetPath ? "".concat(targetPath, ".").concat(suffixPath) : suffixPath;
        }
        case "navigation_suffix": {
            var suffix = node.childForFieldName("suffix");
            return suffix
                ? getNavigationPath(suffix, context)
                : getNodeText(node, context).replace(/^\./, "");
        }
        default:
            return getNodeText(node, context).replace(/^\./, "");
    }
}
function getLastPathComponent(path) {
    var _a;
    var segments = path.split(".");
    return (_a = segments[segments.length - 1]) !== null && _a !== void 0 ? _a : path;
}
function parseCallDetails(node, context) {
    var _a, _b;
    var callee = node.namedChild(0);
    if (!callee) {
        throw new Error("call_expression missing callee");
    }
    var suffixes = getNamedChildrenByType(node, "call_suffix");
    var argumentsList = [];
    var trailingClosures = [];
    for (var _i = 0, suffixes_1 = suffixes; _i < suffixes_1.length; _i++) {
        var suffix = suffixes_1[_i];
        for (var _c = 0, _d = suffix.namedChildren; _c < _d.length; _c++) {
            var child = _d[_c];
            if (child.type === "value_arguments") {
                for (var _e = 0, _f = child.namedChildren; _e < _f.length; _e++) {
                    var argumentNode = _f[_e];
                    if (argumentNode.type !== "value_argument") {
                        continue;
                    }
                    var labelNode = argumentNode.childForFieldName("name");
                    var valueNode = argumentNode.childForFieldName("value");
                    if (!valueNode) {
                        continue;
                    }
                    var labelIdentifier = (_b = (_a = labelNode === null || labelNode === void 0 ? void 0 : labelNode.namedChild(0)) !== null && _a !== void 0 ? _a : labelNode) !== null && _b !== void 0 ? _b : null;
                    argumentsList.push({
                        label: labelIdentifier
                            ? getNodeText(labelIdentifier, context)
                            : null,
                        value: valueNode,
                    });
                }
            }
            else if (child.type === "lambda_literal") {
                trailingClosures.push(child);
            }
        }
    }
    return {
        node: node,
        callee: callee,
        calleeName: getLastPathComponent(getNavigationPath(callee, context)),
        arguments: argumentsList,
        suffixes: suffixes,
        trailingClosures: trailingClosures,
    };
}
function parseNumberLiteral(node, context) {
    if (node.type === "integer_literal" ||
        node.type === "real_literal") {
        var value = Number(getNodeText(node, context));
        return Number.isFinite(value) ? value : null;
    }
    if (node.type === "prefix_expression") {
        var value = Number(getNodeText(node, context));
        return Number.isFinite(value) ? value : null;
    }
    return null;
}
function parseBooleanLiteral(node, context) {
    if (node.type !== "boolean_literal") {
        return null;
    }
    var raw = getNodeText(node, context);
    if (raw === "true") {
        return true;
    }
    if (raw === "false") {
        return false;
    }
    return null;
}
function parseSizeValue(node, context) {
    var path = getNavigationPath(node, context);
    if (getLastPathComponent(path) === "infinity") {
        return { kind: "infinity" };
    }
    var numeric = parseNumberLiteral(node, context);
    if (numeric !== null) {
        return { kind: "fixed", value: numeric };
    }
    return null;
}
function parseAlignmentValue(node, context) {
    var raw = getLastPathComponent(getNavigationPath(node, context));
    switch (raw) {
        case "center":
        case "leading":
        case "trailing":
        case "top":
        case "bottom":
        case "topLeading":
        case "topTrailing":
        case "bottomLeading":
        case "bottomTrailing":
            return raw;
        default:
            return null;
    }
}
function parseEdgeSet(node, context) {
    var raw = getLastPathComponent(getNavigationPath(node, context));
    switch (raw) {
        case "all":
            return { kind: "all" };
        case "horizontal":
            return { kind: "horizontal" };
        case "vertical":
            return { kind: "vertical" };
        case "top":
            return { kind: "top" };
        case "bottom":
            return { kind: "bottom" };
        case "leading":
            return { kind: "leading" };
        case "trailing":
            return { kind: "trailing" };
        default:
            return null;
    }
}
function parseStringLiteral(node, context) {
    var _a;
    if (node.type !== "line_string_literal" &&
        node.type !== "multi_line_string_literal") {
        return null;
    }
    var content = "";
    var isDynamic = false;
    for (var _i = 0, _b = node.namedChildren; _i < _b.length; _i++) {
        var child = _b[_i];
        if (child.type === "line_str_text" ||
            child.type === "multi_line_str_text") {
            content += getNodeText(child, context);
            continue;
        }
        if (child.type === "interpolated_expression" ||
            child.type === "interpolation") {
            var valueNode = (_a = child.childForFieldName("value")) !== null && _a !== void 0 ? _a : child.namedChild(0);
            var valueText = valueNode
                ? getNodeText(valueNode, context)
                : "";
            content += "${".concat(valueText, "}");
            isDynamic = true;
        }
    }
    if (content.length === 0) {
        var raw = getNodeText(node, context);
        content = raw.replace(/^"/, "").replace(/"$/, "");
    }
    return { content: content, isDynamic: isDynamic };
}
