import * as vscode from "vscode";
import { SidebarProvider } from "./SidebarProvider";
import { handleAddTodo } from "./utils";


export function activate(context: vscode.ExtensionContext) {
  const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right
  );

  const sidebarProvider = new SidebarProvider(context.extensionUri);

  statusBarItem.text = "$(diff-added) Add Todo";
  statusBarItem.command = "vstodo.addTodo";
  statusBarItem.show();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider("vstodo-sidebar", sidebarProvider)
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("vstodo.addTodo", () => handleAddTodo(sidebarProvider))
  );
}




export function deactivate() {}
