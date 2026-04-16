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
exports.getTreeSitterRuntime = getTreeSitterRuntime;
exports.resetTreeSitterRuntime = resetTreeSitterRuntime;
var fs = require("fs");
var path = require("path");
var vscode = require("vscode");
var web_tree_sitter_1 = require("web-tree-sitter");
var outputChannel_1 = require("../extension/outputChannel");
var runtimePromise;
function resolveCoreWasmPath(extensionUri) {
    if (extensionUri) {
        return vscode.Uri.joinPath(extensionUri, "out", "web-tree-sitter.wasm").fsPath;
    }
    var candidates = [
        path.resolve(__dirname, "..", "web-tree-sitter.wasm"),
        path.resolve(__dirname, "..", "..", "out", "web-tree-sitter.wasm"),
        path.resolve(__dirname, "..", "..", "node_modules", "web-tree-sitter", "web-tree-sitter.wasm"),
    ];
    var resolvedCandidate = candidates.find(function (candidate) {
        return fs.existsSync(candidate);
    });
    return resolvedCandidate !== null && resolvedCandidate !== void 0 ? resolvedCandidate : path.resolve(__dirname, "..", "web-tree-sitter.wasm");
}
function resolveSwiftWasmPath(extensionUri) {
    if (extensionUri) {
        return vscode.Uri.joinPath(extensionUri, "out", "tree-sitter-swift.wasm").fsPath;
    }
    var candidates = [
        path.resolve(__dirname, "..", "tree-sitter-swift.wasm"),
        path.resolve(__dirname, "..", "..", "out", "tree-sitter-swift.wasm"),
        path.resolve(__dirname, "..", "..", "tree-sitter-swift.wasm"),
    ];
    var resolvedCandidate = candidates.find(function (candidate) {
        return fs.existsSync(candidate);
    });
    return resolvedCandidate !== null && resolvedCandidate !== void 0 ? resolvedCandidate : path.resolve(__dirname, "..", "tree-sitter-swift.wasm");
}
function createRuntime(options) {
    return __awaiter(this, void 0, void 0, function () {
        var coreWasmPath, swiftWasmPath, language, parser;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    coreWasmPath = resolveCoreWasmPath(options.extensionUri);
                    swiftWasmPath = resolveSwiftWasmPath(options.extensionUri);
                    return [4 /*yield*/, web_tree_sitter_1.Parser.init({
                            locateFile: function (scriptName) {
                                if (scriptName.endsWith(".wasm")) {
                                    return coreWasmPath;
                                }
                                return scriptName;
                            },
                        })];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, web_tree_sitter_1.Language.load(swiftWasmPath)];
                case 2:
                    language = _b.sent();
                    parser = new web_tree_sitter_1.Parser();
                    parser.setLanguage(language);
                    (0, outputChannel_1.log)("Stage 1 parser ready (".concat((_a = language.name) !== null && _a !== void 0 ? _a : "unknown-language", ")"));
                    return [2 /*return*/, { language: language, parser: parser }];
            }
        });
    });
}
function getTreeSitterRuntime() {
    return __awaiter(this, arguments, void 0, function (options) {
        if (options === void 0) { options = {}; }
        return __generator(this, function (_a) {
            if (!runtimePromise) {
                runtimePromise = createRuntime(options).catch(function (error) {
                    runtimePromise = undefined;
                    throw error;
                });
            }
            return [2 /*return*/, runtimePromise];
        });
    });
}
function resetTreeSitterRuntime() {
    runtimePromise = undefined;
}
