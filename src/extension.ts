import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('launchMochaTests.debugTest', () => {
		const activeEditor = vscode.window.activeTextEditor;
		if (!activeEditor) {
			vscode.window.showInformationMessage("No file opened");
			return;
		}
		const workspaceFolder = vscode.workspace.getWorkspaceFolder(activeEditor.document.uri);
		if (!workspaceFolder) {
			vscode.window.showInformationMessage("No Workspace Folder found");
			return;
		}
		const outDir = vscode.workspace.getConfiguration().get<string>('launchMochaTests.ts.outDir');
		const filePath = getFilePath(vscode.window.activeTextEditor.document.fileName, outDir, workspaceFolder);
		if (filePath) {
			vscode.debug.startDebugging(workspaceFolder, getLaunchConfig(filePath, outDir))
				.then(started => {
					if (started) {
						const activeDebugSession = vscode.debug.activeDebugSession;
						vscode.debug.onDidTerminateDebugSession(e => {
							if (e.id === activeDebugSession.id) {
								e.customRequest('workbench.debug.panel.action.clearReplAction');
							}
						});
					}
				});
		}
	}));
}

function getFilePath(filePath: string, outDir: string, workspaceFolder: vscode.WorkspaceFolder): string {
	const jsFile = filePath.endsWith('.ts') ? workspaceFolder.uri.fsPath + '/' + outDir + filePath.substring(workspaceFolder.uri.fsPath.length + 4, filePath.length - 3) + '.js' : filePath;
	if (jsFile.endsWith('.js')) {
		return jsFile;
	}
	vscode.window.showWarningMessage(`Cannot launch Mocha tests for the current file '${filePath}'`);
	return null;
}

function getLaunchConfig(file: string, outDir: string): any {
	const launch = {
		"name": "Launch Test - " + file,
		"type": "node",
		"request": "launch",
		"protocol": "inspector",
		"program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
		"runtimeExecutable": "${execPath}",
		"stopOnEntry": false,
		"args": [
			"--timeout",
			"999999",
			"--run",
			file
		],
		"cwd": "${workspaceFolder}",
		"runtimeArgs": [],
		"env": {
			"ELECTRON_RUN_AS_NODE": "true"
		},
		"sourceMaps": true,
		"outFiles": [
			"${workspaceFolder}/out/**/*.js"
		]
	}
	return launch;
}

export function deactivate() {
}