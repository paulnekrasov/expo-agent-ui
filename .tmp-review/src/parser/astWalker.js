"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walkDepthFirst = walkDepthFirst;
function walkDepthFirst(root, visitors) {
    var stopped = false;
    var visitNode = function (node) {
        var _a, _b;
        if (stopped) {
            return;
        }
        var skipChildren = false;
        var control = {
            skipChildren: function () {
                skipChildren = true;
            },
            stop: function () {
                stopped = true;
            },
        };
        (_a = visitors[node.type]) === null || _a === void 0 ? void 0 : _a.call(visitors, node, control);
        if (stopped) {
            return;
        }
        (_b = visitors["*"]) === null || _b === void 0 ? void 0 : _b.call(visitors, node, control);
        if (stopped || skipChildren) {
            return;
        }
        for (var _i = 0, _c = node.namedChildren; _i < _c.length; _i++) {
            var child = _c[_i];
            visitNode(child);
            if (stopped) {
                return;
            }
        }
    };
    visitNode(root);
}
