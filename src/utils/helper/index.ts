import * as vscode from 'vscode';

export const getParams = (str: string) => {
    var queryString = str;
    var keyValPairs = [];
    var params: any = {};
    queryString = queryString.replace(/.*?\?/, "");

    if (queryString.length) {
        keyValPairs = queryString.split('&');
        for (let pairNum in keyValPairs) {
            var key = keyValPairs[pairNum].split('=')[0];
            if (!key.length) { continue; }
            if (typeof params[key] === 'undefined') {

                params[key] = [];
            }
            params[key].push(keyValPairs[pairNum].split('=')[1]);

        }
    }
    return params;
};


export const getNonce = (): string => {
    let text = "";
    const possible =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

const statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left
);


export const updateStatusBarItem = (value: {
    incomplete: number;
    complete: number;
}) => {
    statusBarItem.hide();
    statusBarItem.text = `Task: ${value.incomplete} $(circle-large-outline) ${value.complete} $(pass-filled)`;
    statusBarItem.show();
};