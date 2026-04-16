"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSwiftFile = parseSwiftFile;
var outputChannel_1 = require("../extension/outputChannel");
var builders_1 = require("../ir/builders");
var astWalker_1 = require("./astWalker");
var views_1 = require("./extractors/views");
var shared_1 = require("./extractors/shared");
var treeSitterSetup_1 = require("./treeSitterSetup");
function hasViewInheritance(declarationNode, context) {
    var inheritanceNode = (0, shared_1.getFirstNamedChildByType)(declarationNode, "inheritance_specifier");
    if (!inheritanceNode) {
        return false;
    }
    return (0, shared_1.getNodeText)(inheritanceNode, context)
        .split(",")
        .map(function (segment) { return segment.trim(); })
        .some(function (segment) { return segment.endsWith("View"); });
}
function isPreviewableViewDeclaration(declarationNode, context) {
    var declarationKind = declarationNode.childForFieldName("declaration_kind");
    var kindText = declarationKind
        ? (0, shared_1.getNodeText)(declarationKind, context)
        : "";
    if (kindText !== "struct" && kindText !== "class") {
        return false;
    }
    return hasViewInheritance(declarationNode, context);
}
function isBodyProperty(propertyNode, context) {
    var nameNode = propertyNode.childForFieldName("name");
    if (!nameNode) {
        return false;
    }
    return (0, shared_1.getNodeText)(nameNode, context) === "body";
}
function parseBodyProperty(propertyNode, context) {
    var _a;
    var computedValueNode = propertyNode.childForFieldName("computed_value");
    if (computedValueNode) {
        var children = (0, views_1.parseViewNodesFromStatements)((0, shared_1.getStatementsNodeFromComputedProperty)(computedValueNode), context);
        if (children.length === 0) {
            return null;
        }
        if (children.length === 1) {
            return (_a = children[0]) !== null && _a !== void 0 ? _a : null;
        }
        return (0, shared_1.withSourceRange)((0, builders_1.makeGroup)(children), propertyNode);
    }
    var storedValueNode = propertyNode.childForFieldName("value");
    if (storedValueNode &&
        (storedValueNode.type === "call_expression" ||
            storedValueNode.type === "if_statement")) {
        return (0, views_1.parseViewNode)(storedValueNode, context);
    }
    return null;
}
function extractViewDeclarations(rootNode, context) {
    var roots = [];
    (0, astWalker_1.walkDepthFirst)(rootNode, {
        class_declaration: function (node, control) {
            if (!isPreviewableViewDeclaration(node, context)) {
                return;
            }
            var bodyNode = (0, shared_1.getFirstNamedChildByType)(node, "class_body");
            if (!bodyNode) {
                control.skipChildren();
                return;
            }
            for (var _i = 0, _a = (0, shared_1.getNamedChildrenByType)(bodyNode, "property_declaration"); _i < _a.length; _i++) {
                var propertyNode = _a[_i];
                if (!isBodyProperty(propertyNode, context)) {
                    continue;
                }
                var rootView = parseBodyProperty(propertyNode, context);
                if (rootView) {
                    roots.push(rootView);
                }
            }
            control.skipChildren();
        },
    });
    return roots;
}
function extractTopLevelViewExpressions(rootNode, context) {
    return rootNode.namedChildren
        .filter(function (child) {
        return child.type === "call_expression" || child.type === "if_statement";
    })
        .map(function (child) { return (0, views_1.parseViewNode)(child, context); });
}
function parseSwiftFile(source_1) {
    return __awaiter(this, arguments, void 0, function (source, options) {
        var normalizedSource, context, parser, tree, extractedViews, topLevelViews, error_1;
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    normalizedSource = (0, shared_1.normalizeSwiftSource)(source);
                    context = {
                        source: normalizedSource,
                    };
                    (0, builders_1.resetIdCounter)();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, treeSitterSetup_1.getTreeSitterRuntime)(options)];
                case 2:
                    parser = (_a.sent()).parser;
                    tree = parser.parse(normalizedSource);
                    if (!tree) {
                        (0, outputChannel_1.log)("Stage 1 parser returned no syntax tree");
                        return [2 /*return*/, [(0, builders_1.makeUnknown)("source_file", normalizedSource)]];
                    }
                    extractedViews = extractViewDeclarations(tree.rootNode, context);
                    if (extractedViews.length > 0) {
                        (0, outputChannel_1.log)("Stage 2 extracted ".concat(extractedViews.length, " root view(s)"));
                        return [2 /*return*/, extractedViews];
                    }
                    topLevelViews = extractTopLevelViewExpressions(tree.rootNode, context);
                    if (topLevelViews.length > 0) {
                        (0, outputChannel_1.log)("Stage 2 extracted ".concat(topLevelViews.length, " top-level view expression(s)"));
                        return [2 /*return*/, topLevelViews];
                    }
                    (0, outputChannel_1.log)("Stage 2 extractor found no previewable view roots");
                    return [2 /*return*/, [
                            (0, shared_1.withSourceRange)((0, builders_1.makeUnknown)(tree.rootNode.type, normalizedSource), tree.rootNode),
                        ]];
                case 3:
                    error_1 = _a.sent();
                    (0, outputChannel_1.logError)("Stage 1/2 parse failed", error_1);
                    return [2 /*return*/, [(0, builders_1.makeUnknown)("source_file", normalizedSource)]];
                case 4: return [2 /*return*/];
            }
        });
    });
}
