// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {execSync} from 'child_process';
import * as path from 'path';

import * as fs from 'fs';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('dotnet.publish',
		async (fileUri: vscode.Uri) => {
		
		const terminalIndex = vscode.window.terminals.findIndex(e => e.name === 'dotnet');
		const terminal = terminalIndex === -1 ? vscode.window.createTerminal('dotnet') : vscode.window.terminals[terminalIndex];
		
		const extension = path.extname(fileUri.fsPath);
		
		if (extension === '.pubxml') { }
			// execSync(command)
		else if (extension === '.csproj') {
			
			const publishDir = path.join(path.dirname(fileUri.fsPath), 'Properties', 'PublishProfiles');

			const items = fs.readdirSync(publishDir, { withFileTypes: true })
				.filter(e => path.extname(e.name) === '.pubxml')
				.map(e => path.basename(e.name));

			const profile = await vscode.window.showQuickPick(
				items, {
					title: 'Select publish profile',
				});
			
			if (profile) {
				const command = `dotnet publish ${fileUri.fsPath} /p:PublishProfile=${path.join(publishDir, profile)}`;
				
				terminal.show();
				terminal.sendText(command);		
			}
		}
	}));
}

// This method is called when your extension is deactivated
export function deactivate() {}
