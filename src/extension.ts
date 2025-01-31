import * as vscode from 'vscode';

class Controller {
  private firstChar: string = '';
  private secondChar: string = '';
  private twoKeysDelay: number = 0;
  private defs: any;
  private time: number = 0;
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
    if(typeof twoKeysDelay !== "number") {
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
    if (!this.keyChars.includes(char)) {
      this.firstChar = '';
      this.secondChar = '';
      this.time = 0;
      editor.edit((builder) => {
				builder.insert(editor.selection.active, char);
			});
      return;
    }    
		if (!this.firstChar) {
			this.firstChar = char;
			this.time = performance.now();
			return;
		}
		this.secondChar = char;
		const key = this.firstChar + this.secondChar;
    const key2 = this.secondChar + this.firstChar;
		const diff = performance.now() - this.time;
    this.firstChar = '';
		this.secondChar = '';
		this.time = 0;
		if (diff > this.twoKeysDelay) {
			editor.edit((builder) => {
				builder.insert(editor.selection.active, key);
			});
			return;
		}
    for (const [k, v] of Object.entries(this.defs)) {
      if (k != key && k != key2) {
        continue;
      }
      if(typeof v === 'string') {
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
}

export function deactivate() { }
