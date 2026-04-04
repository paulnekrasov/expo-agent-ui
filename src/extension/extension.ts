import * as vscode from "vscode";

import { parseSwiftFile } from "../parser";
import {
  clearOutputChannel,
  disposeOutputChannel,
  getOutputChannel,
  log,
  logError,
  showOutputChannel,
} from "./outputChannel";

export function activate(context: vscode.ExtensionContext): void {
  log("SwiftUI Preview activating");

  const openPreview = vscode.commands.registerCommand(
    "swiftui-preview.openPreview",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.languageId !== "swift") {
        void vscode.window.showWarningMessage(
          "Open a Swift file to generate Phase 1 parser output."
        );
        return;
      }

      try {
        const parsedViews = await parseSwiftFile(
          editor.document.getText(),
          { extensionUri: context.extensionUri }
        );

        clearOutputChannel();
        const channel = getOutputChannel();
        channel.appendLine(
          `[SwiftUI Preview] Stage 1/2 IR for ${editor.document.fileName}`
        );
        channel.appendLine(JSON.stringify(parsedViews, null, 2));
        showOutputChannel(true);
      } catch (error) {
        logError("Failed to generate Phase 1 parser output", error);
        void vscode.window.showErrorMessage(
          "SwiftUI Preview could not parse the active Swift file."
        );
      }
    }
  );

  context.subscriptions.push(openPreview);
  log("SwiftUI Preview activated");
}

export function deactivate(): void {
  disposeOutputChannel();
}
