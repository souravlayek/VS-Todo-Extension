import * as vscode from "vscode";

export function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

const statusBarItem = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Left
);

const updateStatusBarItem = (value: {
  incomplete: number;
  complete: number;
}) => {
  statusBarItem.hide();
  statusBarItem.text = `Task: ${value.incomplete} $(circle-large-outline) ${value.complete} $(pass-filled)`;
  statusBarItem.show();
};

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  _doc?: vscode.TextDocument;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    updateStatusBarItem({ complete: 0, incomplete: 0 });
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case "onInfo": {
          if (!data.value) {
            return;
          }
          vscode.window.showInformationMessage(data.value);
          break;
        }
        case "onDeleteRequest": {
          if (!data.value) {
            return;
          }
         const buttonList = ["Yes", "Always", "No"];

          vscode.window
            .showInformationMessage(
              "Do you want to delete.",
              ...buttonList
            )
            .then((res) => {
              switch (res) {
                case "Yes":
                  this._view?.webview?.postMessage({
                    type: "delete-todo",
                    value: JSON.stringify({
                      id: data.value,
                      isAlways: false,
                    }),
                  });
                  break;

                case "Always":
                  this._view?.webview?.postMessage({
                    type: "delete-todo",
                    value: JSON.stringify({
                      id: data.value,
                      isAlways: true,
                    }),
                  });
                  break;
                default:
                  break;
              }
            });
          break;
        }
        case "onWarn": {
          if (!data.value) {
            return;
          }
          vscode.window.showWarningMessage(data.value);
          break;
        }
        case "onError": {
          if (!data.value) {
            return;
          }
          vscode.window.showErrorMessage(data.value);
          break;
        }
        case "onTodoAdd": {
          if (!data.value) {
            return;
          }
          updateStatusBarItem(data.value);
          break;
        }
      }
    });
  }

  public revive(panel: vscode.WebviewView) {
    this._view = panel;
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const styleResetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const styleVSCodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.js")
    );
    const styleMainUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "compiled/sidebar.css")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
        <meta http-equiv="Content-Security-Policy" content="img-src https: data:; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${styleResetUri}" rel="stylesheet">
				<link href="${styleVSCodeUri}" rel="stylesheet">
        <link href="${styleMainUri}" rel="stylesheet">
        <script nonce="${nonce}">
         const tsvscode = acquireVsCodeApi();
        </script>
			</head>
      <body>
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}
