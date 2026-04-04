class MockUri {
  public readonly fsPath: string;

  public constructor(fsPath: string) {
    this.fsPath = fsPath;
  }

  public static file(fsPath: string): MockUri {
    return new MockUri(fsPath);
  }

  public static joinPath(base: MockUri, ...parts: string[]): MockUri {
    const cleanBase = base.fsPath.replace(/[\\/]+$/, "");
    const joined = [cleanBase, ...parts]
      .filter((part) => part.length > 0)
      .join("/");
    return new MockUri(joined);
  }
}

export const window = {
  createOutputChannel: () => ({
    appendLine: () => {},
    clear: () => {},
    show: () => {},
    dispose: () => {},
  }),
  showInformationMessage: () => Promise.resolve(undefined),
  showErrorMessage: () => Promise.resolve(undefined),
  showWarningMessage: () => Promise.resolve(undefined),
  activeTextEditor: undefined,
};

export const commands = {
  registerCommand: (_id: string, _handler: () => void) => ({
    dispose: () => {},
  }),
};

export const workspace = {
  getConfiguration: () => ({ get: () => undefined }),
};

export const Uri = MockUri;
