import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('launchMochaTests.debugTest', () => {
		const outDir = vscode.workspace.getConfiguration().get('launchMochaTests.ts.outDir', 'out');
		const filePath = getFilePath(outDir);
		if (filePath) {
			vscode.commands.executeCommand('vscode.startDebug', getLaunchConfig(filePath, outDir));
		}
	}));
}

function getFilePath(outDir: string): string {
	const activeEditor = vscode.window.activeTextEditor;
	if (!activeEditor) {
		vscode.window.showInformationMessage("No file opened");
		return null;
	}
	const filePath = activeEditor.document.uri.fsPath;
	const rootpath = vscode.workspace.rootPath;
	const jsFile = filePath.endsWith('.ts') ? rootpath + outDir + filePath.substring(rootpath.length + 4, filePath.length - 3) + '.js' : filePath;
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
		"program": "${workspaceRoot}/node_modules/mocha/bin/_mocha",
		"runtimeExecutable": "${execPath}",
		"stopOnEntry": false,
		"args": [
			"--timeout",
			"999999",
			"--run",
			file
		],
		"cwd": "${workspaceRoot}",
		"runtimeArgs": [],
		"env": {
			"ELECTRON_RUN_AS_NODE": "true"
		},
		"sourceMaps": true,
		"outDir": "${workspaceRoot}/" + outDir
	}
	return launch;
}

// this method is called when your extension is deactivated
export function deactivate() {
}