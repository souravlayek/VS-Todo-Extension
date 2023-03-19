import * as vscode from 'vscode';

const config = vscode.workspace.getConfiguration('vstodo');

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
