import * as vscode from "vscode";
import { SidebarProvider } from "./SidebarProvider";


export function activate(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  );

  
  const sidebarProvider = new SidebarProvider(context.extensionUri);

  const addNewTodo = async (text: string) => {
    const res = await sidebarProvider._view?.webview.postMessage({
      type: "new-todo",
      value: text,
    });
    if (!res) {
      vscode.window.showWarningMessage(
        "Please Open the VSTodo tab before adding todo.(ctrl+k,ctrl+v or cmd+k,cmd+v)"
      );
    }
  };

  statusBarItem.text = "$(diff-added) Add Todo";
  statusBarItem.command = "vstodo.addTodo";
  statusBarItem.show();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("vstodo-sidebar", sidebarProvider)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("vstodo.addTodo", async () => {
      const { activeTextEditor } = vscode.window;
      let options: vscode.InputBoxOptions = {
        prompt: "Enter Task: ",
        placeHolder: "e.g. Your Task #tag1 #tag2",
      };
      if (!activeTextEditor) {
        // vscode.window.showWarningMessage("no active text editor");
        vscode.window.showInputBox(options).then((res: any) => {
          if (!res) {
            return;
          }
          addNewTodo(res);
        });
        return;
      }
      const text = activeTextEditor.document.getText(
        activeTextEditor.selection
      );
      if (text.length === 0) {
        vscode.window.showInputBox(options).then((res: any) => {
          if (!res) {
            return;
          }
          addNewTodo(res);
        });
        // vscode.window.showWarningMessage("no text selected");
        return;
      }
      addNewTodo(text);
    })
  );
}

export function deactivate() {}
