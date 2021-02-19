import * as vscode from 'vscode';
import { SidebarProvider } from './SidebarProvider';

export function activate(context: vscode.ExtensionContext) {
	const sidebarProvider = new SidebarProvider(context.extensionUri);
	
	context.subscriptions.push(
		vscode.commands.registerCommand('vs-todo.helloWorld', () => {
			vscode.window.showInformationMessage('Hello World from Vs Todo!');
		})
	);
	const statusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right
	);
	statusBarItem.text = "$(diff-added) Add Todo";
	statusBarItem.command = "vstodo.addTodo";
	statusBarItem.show();
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(
			"vstodo-sidebar",
			sidebarProvider
		)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('vstodo.addTodo', () => {
				const  {activeTextEditor} = vscode.window;
				if (!activeTextEditor) {
					vscode.window.showWarningMessage("no active text editor");
					return;
				}
				const text = activeTextEditor.document.getText(activeTextEditor.selection);
				if (text.length  === 0) {
					vscode.window.showWarningMessage("no text selected");
					return;
				}
				sidebarProvider._view?.webview.postMessage({type: "new-todo", value: text});
			})
	);
}

export function deactivate() {}
