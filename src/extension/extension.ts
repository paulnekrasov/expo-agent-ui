import * as vscode from "vscode";
import { disposeOutputChannel, log } from "./outputChannel";

export function activate(context: vscode.ExtensionContext): void {
  log("SwiftUI Preview activating");

  const openPreview = vscode.commands.registerCommand(
    "swiftui-preview.openPreview",
    () => {
      vscode.window.showInformationMessage("SwiftUI Preview — coming soon");
    }
  );

  context.subscriptions.push(openPreview);
  log("SwiftUI Preview activated");
}

export function deactivate(): void {
  disposeOutputChannel();
}
