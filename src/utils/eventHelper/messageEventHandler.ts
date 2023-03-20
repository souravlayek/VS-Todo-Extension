import * as vscode from "vscode";
import * as http from "http";
import { updateStatusBarItem, getParams, getSecret, SECRETS_KEY, saveSecret } from "../helper";
import axios from "axios";


const handleInfoMessage = (data: any) => {
  if (!data.value) {
    return;
  }
  vscode.window.showInformationMessage(data.value);
};

const handleIntegrationRequest = async (webview: vscode.Webview) => {
  // const integrationType = await getSecret(SECRETS_KEY.INTEGRATION_TYPE);
  // webview.postMessage({
  //   type: "integration-reply",
  //   value: { type: integrationType, authCode: await getSecret(SECRETS_KEY.TODOIST_AUTH_CODE) },
  // });

  //  FOR DEV PURPOSES
  await saveSecret(SECRETS_KEY.INTEGRATION_TYPE, "todoist");
  await saveSecret(SECRETS_KEY.TODOIST_AUTH_CODE, "1518e4de5a4976892d313c62901094f3830d617a");
  webview.postMessage({
    type: "integration-reply",
    value: {type: "todoist", authCode: "1518e4de5a4976892d313c62901094f3830d617a"},
  });

};

const handleOnDeleteRequest = (data: any, webview: vscode.Webview) => {
  const buttonList = ["Yes", "No"];
  vscode.window.showInformationMessage(
    "Do you want to delete this task?",
    ...buttonList
  ).then((res) => {
    if (res === "Yes" || res === "Always") {
      webview?.postMessage({
        type: "delete-todo",
        value: JSON.stringify({
          id: data.value,
          isAlways: res === "Always",
        }),
      });
    }
  });
};

const handleWarningMessage = (data: any) => {
  if (!data.value) {
    return;
  }
  vscode.window.showWarningMessage(data.value);
};

const handleErrorMessage = (data: any) => {
  if (!data.value) {
    return;
  }
  vscode.window.showErrorMessage(data.value);
};


const handleTodoAdd = (data: any) => {
  if (!data.value) {
    return;
  }
  updateStatusBarItem(data.value);
};

const handleTodoistIntegration = (res: any, webview: vscode.Webview) => {
  if (res !== "Yes") {
    return;
  }
  const authUrl = `https://todoist.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&scope=data:read_write,data:delete&clientSecret=${process.env.CLIENT_SECRET}&state=${process.env.VERIFY_TOKEN}`;
  vscode.env.openExternal(vscode.Uri.parse(authUrl)).then(() => {
    const server = http.createServer(async (req, res) => {
      if (req.method === 'GET' && req.url?.startsWith('/callback')) {
        const myParams = getParams(req.url);
        const authCode = myParams.code?.[0];
        const state = myParams.state?.[0];
        if (state === process.env.VERIFY_TOKEN) {
          const accessTokenEndpoint = `https://todoist.com/oauth/access_token?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&code=${authCode}`;
          try {
            const accessTokenResponse = await axios.post(accessTokenEndpoint);
            console.log(accessTokenResponse.data);
            if (!accessTokenResponse.data?.access_token) {
              throw new Error('No access token');
            }
            await saveSecret(SECRETS_KEY.INTEGRATION_TYPE, "todoist");
            await saveSecret(SECRETS_KEY.TODOIST_AUTH_CODE, accessTokenResponse.data?.access_token);
            vscode.window.showInformationMessage('Integration successful');
            webview.postMessage({
              type: "integration-reply",
              value: {
                authCode: accessTokenResponse.data?.access_token,
                type: "todoist"
              }
            });
            const uriScheme = vscode.env.appName.includes('Insiders') ? 'vscode-insiders' : 'vscode';
            const html = `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <title>VSTodo Todoist Integration</title>
            </head>
            <body>
              <h1>VSTodo Todoist Integration</h1>
              <p>Integration successful. You can close this window now.</p>
              <p>Redirecting to VSTodo...</p>
            </body>
            <script>
              window.addEventListener('load', () => {
                setTimeout(() => {
                  window.location.href = '${uriScheme}://SouravLayek.vstodo';
                }, 2000);
              });
            </script>
            </html>`;
            res.write(html);
            res.end();
            
          } catch (error) {
            vscode.window.showErrorMessage('Integration failed');
            res.writeHead(500);
            res.end();
          }
        }
        server.close();
      } else {
        res.writeHead(404);
        res.end();
      }
    });
    server.listen(3000, () => {
      console.log('Server started on port 3000');
    });

  });
};


const handleIntegrate = async (data: any, webview: vscode.Webview) => {
  if (!data?.value) {
    return;
  }
  if (data.value === "local") {
    await saveSecret(SECRETS_KEY.INTEGRATION_TYPE, "local");
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
      handleTodoistIntegration(res, webview);
    });
  }
};





export const handleMessageRecive = async (data: any, webview: vscode.Webview) => {
  switch (data.type) {
    case "onInfo": {
      return handleInfoMessage(data);
    }
    case "integration-request": {
      handleIntegrationRequest(webview);
    }
    case "integrate": {
      return handleIntegrate(data, webview);
    }
    case "onDeleteRequest": {
      return handleOnDeleteRequest(data, webview);
    }
    case "onWarn": {
      return handleWarningMessage(data);
    }
    case "onError": {
      return handleErrorMessage(data);
    }
    case "onTodoAdd": {
      handleTodoAdd(data);
    }
  }
};