"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutputChannel = getOutputChannel;
exports.log = log;
exports.showOutputChannel = showOutputChannel;
exports.clearOutputChannel = clearOutputChannel;
exports.logError = logError;
exports.disposeOutputChannel = disposeOutputChannel;
var vscode = require("vscode");
var channel;
function getOutputChannel() {
    if (!channel) {
        channel = vscode.window.createOutputChannel("SwiftUI Preview");
    }
    return channel;
}
function log(message) {
    getOutputChannel().appendLine("[SwiftUI Preview] ".concat(message));
}
function showOutputChannel(preserveFocus) {
    if (preserveFocus === void 0) { preserveFocus = false; }
    getOutputChannel().show(preserveFocus);
}
function clearOutputChannel() {
    getOutputChannel().clear();
}
function logError(message, err) {
    var detail = err instanceof Error ? err.message : String(err !== null && err !== void 0 ? err : "");
    getOutputChannel().appendLine("[SwiftUI Preview] ERROR: ".concat(message).concat(detail ? " — " + detail : ""));
}
function disposeOutputChannel() {
    channel === null || channel === void 0 ? void 0 : channel.dispose();
    channel = undefined;
}
