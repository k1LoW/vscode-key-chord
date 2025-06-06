import * as vscode from 'vscode';

class Controller {
  private firstKey: string = '';
  private twoKeysDelay: number = 0;
  private defs: any;
  private time: number = 0;
  private timer: NodeJS.Timeout | null = null;
  private keyChars: string = '';

  public constructor() {
    this.reload();
  }

  public reload() {
    const kcConfig = vscode.workspace.getConfiguration("key-chord");
    const twoKeysDelay = kcConfig.get("twoKeysDelay");
    if (!twoKeysDelay) {
      vscode.window.showErrorMessage("key-chord.twoKeysDelay is not set");
      return;
    }
    if (typeof twoKeysDelay !== "number") {
      vscode.window.showErrorMessage("key-chord.twoKeysDelay is not a number");
      return;
    }
    this.twoKeysDelay = twoKeysDelay;
    const defs: any = kcConfig.get("definitions");
    if (!defs) {
      vscode.window.showErrorMessage("key-chord.definitions is not set");
      return;
    }
    this.defs = defs;
    this.keyChars = Object.keys(defs).join('');
  }

  public process(char: string, editor: vscode.TextEditor) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (!this.keyChars.includes(char)) {
      this.firstKey = '';
      this.time = 0;
      editor.edit((builder) => {
        builder.insert(editor.selection.active, char);
      });
      return;
    }
    if (!this.firstKey) {
      this.firstKey = char;
      this.time = performance.now();
      this.timer = setTimeout(() => {
        if(!this.firstKey) {
          return;
        }
        editor.edit((builder) => {
          builder.insert(editor.selection.active, this.firstKey);
        });
        this.firstKey = '';
        this.time = 0;
      }, this.twoKeysDelay);
      return;
    }
    const secondKey = char;
    const key = this.firstKey + secondKey;
    const key2 = secondKey + this.firstKey;
    const diff = performance.now() - this.time;
    this.firstKey = '';
    this.time = 0;
    if (diff > this.twoKeysDelay) {
      editor.edit((builder) => {
        builder.insert(editor.selection.active, key);
      });
      return;
    }
    for (const [k, v] of Object.entries(this.defs)) {
      if (k !== key && k !== key2) {
        continue;
      }
      if (typeof v === 'string') {
        vscode.commands.executeCommand(v);
        return;
      }
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  const ctrl = new Controller();

  const disposable = vscode.commands.registerCommand('type', (args) => {
    if (!vscode.window.activeTextEditor) {
      return;
    }
    ctrl.process(args.text, vscode.window.activeTextEditor);
  });

  context.subscriptions.push(disposable);

  vscode.workspace.onDidChangeConfiguration(event => {
    let affected = event.affectsConfiguration("key-chord.definitions") || event.affectsConfiguration("key-chord.twoKeysDelay");
    if (affected) {
      ctrl.reload();
    }
  });
}

export function deactivate() { }
