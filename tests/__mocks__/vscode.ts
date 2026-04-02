// Minimal vscode mock for Jest — only what tests actually touch
export const window = {
  createOutputChannel: () => ({
    appendLine: () => {},
    show: () => {},
    dispose: () => {},
  }),
  showInformationMessage: () => Promise.resolve(undefined),
  showErrorMessage: () => Promise.resolve(undefined),
};

export const commands = {
  registerCommand: (_id: string, _handler: () => void) => ({ dispose: () => {} }),
};

export const workspace = {
  getConfiguration: () => ({ get: () => undefined }),
};
