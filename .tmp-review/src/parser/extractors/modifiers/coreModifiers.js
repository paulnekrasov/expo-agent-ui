"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCoreModifier = parseCoreModifier;
var builders_1 = require("../../../ir/builders");
var shared_1 = require("../shared");
var FONT_STYLE_NAMES = new Set([
    "largeTitle",
    "title",
    "title2",
    "title3",
    "headline",
    "body",
    "callout",
    "subheadline",
    "footnote",
    "caption",
    "caption2",
]);
function getFirstArgument(call) {
    var _a, _b;
    return (_b = (_a = call.arguments[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : null;
}
function getCallRawArgs(call, context) {
    return call.suffixes
        .map(function (suffix) { return (0, shared_1.getNodeText)(suffix, context); })
        .join(" ");
}
function parseColorValue(node, context) {
    var navigationPath = (0, shared_1.getNavigationPath)(node, context);
    var rawName = (0, shared_1.getLastPathComponent)(navigationPath);
    if (node.type === "prefix_expression" ||
        node.type === "simple_identifier") {
        return { kind: "system", name: rawName };
    }
    if (node.type === "navigation_expression") {
        if (navigationPath.startsWith("Color.") ||
            navigationPath.startsWith("UIColor.")) {
            return { kind: "system", name: rawName };
        }
        return { kind: "unknown", raw: navigationPath };
    }
    return { kind: "unknown", raw: (0, shared_1.getNodeText)(node, context) };
}
function parseFontModifier(call, context) {
    var argumentNode = getFirstArgument(call);
    if (!argumentNode) {
        return { kind: "unknown", name: "font", rawArgs: "" };
    }
    var styleName = (0, shared_1.getLastPathComponent)((0, shared_1.getNavigationPath)(argumentNode, context));
    if (FONT_STYLE_NAMES.has(styleName)) {
        return {
            kind: "font",
            style: styleName,
        };
    }
    return {
        kind: "unknown",
        name: "font",
        rawArgs: getCallRawArgs(call, context),
    };
}
function parseForegroundColorModifier(call, context) {
    var argumentNode = getFirstArgument(call);
    if (!argumentNode) {
        return {
            kind: "unknown",
            name: "foregroundColor",
            rawArgs: "",
        };
    }
    return {
        kind: "foregroundColor",
        color: parseColorValue(argumentNode, context),
    };
}
function parsePaddingModifier(call, context) {
    var _a, _b, _c, _d;
    var firstArgument = (_b = (_a = call.arguments[0]) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : null;
    var secondArgument = (_d = (_c = call.arguments[1]) === null || _c === void 0 ? void 0 : _c.value) !== null && _d !== void 0 ? _d : null;
    if (!firstArgument) {
        return {
            kind: "padding",
            edges: { kind: "all" },
            amount: { kind: "unspecified" },
        };
    }
    var numericAmount = (0, shared_1.parseNumberLiteral)(firstArgument, context);
    if (numericAmount !== null) {
        return {
            kind: "padding",
            edges: { kind: "all" },
            amount: { kind: "fixed", value: numericAmount },
        };
    }
    var edges = (0, shared_1.parseEdgeSet)(firstArgument, context);
    if (!edges) {
        return {
            kind: "unknown",
            name: "padding",
            rawArgs: getCallRawArgs(call, context),
        };
    }
    var amount = secondArgument
        ? (0, shared_1.parseSizeValue)(secondArgument, context)
        : null;
    return {
        kind: "padding",
        edges: edges,
        amount: amount !== null && amount !== void 0 ? amount : { kind: "unspecified" },
    };
}
function parseFrameModifier(call, context) {
    var modifier = {
        kind: "frame",
    };
    for (var _i = 0, _a = call.arguments; _i < _a.length; _i++) {
        var argument = _a[_i];
        if (!argument.label) {
            continue;
        }
        switch (argument.label) {
            case "width": {
                var value = (0, shared_1.parseSizeValue)(argument.value, context);
                if (value) {
                    modifier.width = value;
                }
                break;
            }
            case "height": {
                var value = (0, shared_1.parseSizeValue)(argument.value, context);
                if (value) {
                    modifier.height = value;
                }
                break;
            }
            case "minWidth": {
                var value = (0, shared_1.parseSizeValue)(argument.value, context);
                if (value) {
                    modifier.minWidth = value;
                }
                break;
            }
            case "maxWidth": {
                var value = (0, shared_1.parseSizeValue)(argument.value, context);
                if (value) {
                    modifier.maxWidth = value;
                }
                break;
            }
            case "minHeight": {
                var value = (0, shared_1.parseSizeValue)(argument.value, context);
                if (value) {
                    modifier.minHeight = value;
                }
                break;
            }
            case "maxHeight": {
                var value = (0, shared_1.parseSizeValue)(argument.value, context);
                if (value) {
                    modifier.maxHeight = value;
                }
                break;
            }
            case "alignment": {
                var value = (0, shared_1.parseAlignmentValue)(argument.value, context);
                if (value) {
                    modifier.alignment = value;
                }
                break;
            }
            default:
                break;
        }
    }
    return modifier;
}
function parseBackgroundViewContent(lambdaNode, context, parseNestedView) {
    var _a;
    var statementsNode = (0, shared_1.getStatementsNodeFromLambda)(lambdaNode);
    if (!statementsNode) {
        return null;
    }
    var children = statementsNode.namedChildren
        .filter(function (child) {
        return child.type === "call_expression" || child.type === "if_statement";
    })
        .map(function (child) { return parseNestedView(child, context); });
    if (children.length === 0) {
        return null;
    }
    if (children.length === 1) {
        return (_a = children[0]) !== null && _a !== void 0 ? _a : null;
    }
    return (0, builders_1.makeGroup)(children);
}
function parseBackgroundModifier(call, context, parseNestedView) {
    var argumentNode = getFirstArgument(call);
    if (argumentNode) {
        if (argumentNode.type === "call_expression") {
            return {
                kind: "background",
                content: parseNestedView(argumentNode, context),
            };
        }
        return {
            kind: "background",
            content: parseColorValue(argumentNode, context),
        };
    }
    var closure = call.trailingClosures[0];
    if (!closure) {
        return {
            kind: "unknown",
            name: "background",
            rawArgs: "",
        };
    }
    var content = parseBackgroundViewContent(closure, context, parseNestedView);
    if (!content) {
        return {
            kind: "unknown",
            name: "background",
            rawArgs: getCallRawArgs(call, context),
        };
    }
    return {
        kind: "background",
        content: content,
    };
}
function parseCornerRadiusModifier(call, context) {
    var argumentNode = getFirstArgument(call);
    var radius = argumentNode
        ? (0, shared_1.parseNumberLiteral)(argumentNode, context)
        : null;
    if (radius === null) {
        return {
            kind: "unknown",
            name: "cornerRadius",
            rawArgs: getCallRawArgs(call, context),
        };
    }
    return {
        kind: "cornerRadius",
        radius: radius,
    };
}
function parseOpacityModifier(call, context) {
    var argumentNode = getFirstArgument(call);
    var value = argumentNode
        ? (0, shared_1.parseNumberLiteral)(argumentNode, context)
        : null;
    if (value === null) {
        return {
            kind: "unknown",
            name: "opacity",
            rawArgs: getCallRawArgs(call, context),
        };
    }
    return {
        kind: "opacity",
        value: value,
    };
}
function parseNavigationTitleModifier(call, context) {
    var argumentNode = getFirstArgument(call);
    if (!argumentNode) {
        return {
            kind: "unknown",
            name: "navigationTitle",
            rawArgs: "",
        };
    }
    var parsedString = (0, shared_1.parseStringLiteral)(argumentNode, context);
    if (parsedString) {
        return {
            kind: "navigationTitle",
            title: parsedString.content,
        };
    }
    return {
        kind: "navigationTitle",
        title: (0, shared_1.getNodeText)(argumentNode, context),
    };
}
function parseCoreModifier(name, call, context, parseNestedView) {
    switch (name) {
        case "font":
            return parseFontModifier(call, context);
        case "foregroundColor":
            return parseForegroundColorModifier(call, context);
        case "padding":
            return parsePaddingModifier(call, context);
        case "frame":
            return parseFrameModifier(call, context);
        case "background":
            return parseBackgroundModifier(call, context, parseNestedView);
        case "cornerRadius":
            return parseCornerRadiusModifier(call, context);
        case "opacity":
            return parseOpacityModifier(call, context);
        case "navigationTitle":
            return parseNavigationTitleModifier(call, context);
        case "disabled": {
            var argumentNode = getFirstArgument(call);
            var value = argumentNode
                ? (0, shared_1.parseBooleanLiteral)(argumentNode, context)
                : null;
            if (value !== null) {
                return {
                    kind: "disabled",
                    value: value,
                };
            }
            break;
        }
        default:
            break;
    }
    return {
        kind: "unknown",
        name: name,
        rawArgs: getCallRawArgs(call, context),
    };
}
