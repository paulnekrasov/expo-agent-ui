import * as vscode from "vscode";

let channel: vscode.OutputChannel | undefined;

export function getOutputChannel(): vscode.OutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel("SwiftUI Preview");
  }
  return channel;
}

export function log(message: string): void {
  getOutputChannel().appendLine(`[SwiftUI Preview] ${message}`);
}

export function logError(message: string, err?: unknown): void {
  const detail = err instanceof Error ? err.message : String(err ?? "");
  getOutputChannel().appendLine(`[SwiftUI Preview] ERROR: ${message}${detail ? " — " + detail : ""}`);
}

export function disposeOutputChannel(): void {
  channel?.dispose();
  channel = undefined;
}
