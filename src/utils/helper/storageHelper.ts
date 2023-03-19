import * as vscode from "vscode";

export const saveSecret = async (key: string, value: string): Promise<void> => {
    const secretStorage = vscode.workspace.getConfiguration().get<vscode.SecretStorage>('secrets');
    await secretStorage?.store(key, value);
};

export const getSecret = async (key: string): Promise<string> => {
    const secretStorage = vscode.workspace.getConfiguration().get<vscode.SecretStorage>('secrets');
    const value = await secretStorage?.get(key);
    return value ?? "";
};

export const SECRETS_KEY = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    TODOIST_AUTH_CODE: "todoist_auth_code",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    INTEGRATION_TYPE: "integration_type"
};