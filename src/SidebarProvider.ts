import * as vscode from "vscode";
import * as http from "http";

const config = vscode.workspace.getConfiguration('vstodo');

const clientID = "8ee4366e462041cdb3b63bfad29af10d";
const clientSecret = "b151c18ca87d4217aa290b2e89b783d0";
const verifyToken = "21468_6f0725ade7e27113950c1a7c";

const getParams = (str: string) => {
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

export const setIntegrationType = (type: "local" | "todoist") => {
  config.update('integration', type, true);
};

export const setIntegrationConfig = (_config: {authCode: string}) => {
  config.update('todoistConfigOptions', _config, true);
};
export const getIntegrationType = (): string => {
  return config.get('integration') ?? "";
};

export const getAuthCode = (): string => {
  return (config.get("todoistConfigOptions") as any)?.authCode ?? "";
};

export function getNonce() {
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

  constructor(private readonly _extensionUri: vscode.Uri) { }

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
        case "integration-request": {
          const integrationType = getIntegrationType();
          webviewView.webview.postMessage({
            type: "integration-reply",
            value: {type: integrationType, authCode: getAuthCode()},
          });
        }
        case "integrate": {
          if (data.value === "local") {
            setIntegrationType("local");
            this._view?.webview.postMessage({
              type: "integration-reply",
              value: {
                type: "local",
                authCode: ""
              }
            });
          } else if (data.value === "todoist") {
            const buttonList = ["Yes", "No"];
            vscode.window.showInformationMessage(
              "Do you want to integrate with Todoist?",
              ...buttonList
            ).then((res) => {
              if (res === "Yes") {
                const authUrl = `https://todoist.com/oauth/authorize?client_id=${clientID}&scope=data:read_write,data:delete&clientSecret=${clientSecret}&state=${verifyToken}`;
                vscode.env.openExternal(vscode.Uri.parse(authUrl)).then(() => {
                  const server = http.createServer((req, res) => {
                    if (req.method === 'GET' && req.url?.startsWith('/callback')) {
                      const myParams = getParams(req.url);
                      const authCode = myParams.code?.[0];
                      const state = myParams.state?.[0];
                      if (state === verifyToken) {
                        setIntegrationType("todoist");
                        setIntegrationConfig({ authCode });
                        vscode.window.showInformationMessage('Integration successful');
                        this._view?.webview.postMessage({
                          type: "integration-reply",
                          value: {
                            authCode,
                            type: "todoist"
                          }
                        });
                      }
                      const uriScheme = vscode.env.appName.includes('Insiders') ? 'vscode-insiders' : 'vscode';
                      // eslint-disable-next-line @typescript-eslint/naming-convention
                      res.writeHead(302, { Location: `${uriScheme}://SouravLayek.vs-todo` });
                      res.end();
                      server.close();
                    } else {
                      res.writeHead(404);
                      res.end();
                    }
                  });

                  // Start the server and listen for incoming requests
                  server.listen(3000, () => {
                    console.log('Server started on port 3000');
                  });

                });

              }
            }
            );
          }
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
