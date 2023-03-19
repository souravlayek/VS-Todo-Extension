import * as vscode from 'vscode';
import { SidebarProvider } from '../../SidebarProvider';

const inputBoxOptions: vscode.InputBoxOptions = {
    prompt: "Enter Task: ",
    placeHolder: "e.g. Your Task #tag1 #tag2",
};

const addNewTodo = async (sidebarProvider: SidebarProvider, text: string) => {
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

const openInputBoxAndAddTodo = (sidebarProvider: SidebarProvider) => {
    vscode.window.showInputBox(inputBoxOptions).then((res: any) => {
        if (!res) {
            return;
        }
        addNewTodo(sidebarProvider, res);
    });
};

export const handleAddTodo = (sidebarProvider: SidebarProvider) => {
    const { activeTextEditor } = vscode.window;

    if (!activeTextEditor) {
        openInputBoxAndAddTodo(sidebarProvider);
        return;
    }
    const text = activeTextEditor.document.getText(
        activeTextEditor.selection
    );
    if (text.length === 0) {
        openInputBoxAndAddTodo(sidebarProvider);
        return;
    }
    addNewTodo(sidebarProvider, text);
};