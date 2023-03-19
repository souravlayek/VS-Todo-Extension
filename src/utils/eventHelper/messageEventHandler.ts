import * as vscode from "vscode";
import * as http from "http";
import { updateStatusBarItem, getParams } from "../helper";

import { getAuthCode, getIntegrationType, setIntegrationConfig, setIntegrationType } from "../helper/workspaceConfigHelper";
export const handleMessageRecive =  async (data: any, webview: vscode.Webview) => {
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
        webview.postMessage({
          type: "integration-reply",
          value: {type: integrationType, authCode: getAuthCode()},
        });
      }
      case "integrate": {
        if (data.value === "local") {
          setIntegrationType("local");
          webview.postMessage({
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
              const authUrl = `https://todoist.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=data:read_write,data:delete&clientSecret=${process.env.CLIENT_SECRET}&state=${process.env.VERIFY_TOKEN}`;
              vscode.env.openExternal(vscode.Uri.parse(authUrl)).then(() => {
                const server = http.createServer((req, res) => {
                  if (req.method === 'GET' && req.url?.startsWith('/callback')) {
                    const myParams = getParams(req.url);
                    const authCode = myParams.code?.[0];
                    const state = myParams.state?.[0];
                    if (state === process.env.VERIFY_TOKEN) {
                      setIntegrationType("todoist");
                      setIntegrationConfig({ authCode });
                      vscode.window.showInformationMessage('Integration successful');
                      webview.postMessage({
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
                webview?.postMessage({
                  type: "delete-todo",
                  value: JSON.stringify({
                    id: data.value,
                    isAlways: false,
                  }),
                });
                break;
  
              case "Always":
                webview?.postMessage({
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
  };