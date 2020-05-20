// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import { openjq } from './commands';
import { functionsCompletion } from './language';
import { RootCodeLensProvider } from './codeLens';
import { initServices } from './services';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "jq-vscode" is now active!');

	const selectors = [
		{ language: 'jqx', scheme: 'file' },
		{ language: 'jqx', scheme: 'untitled' },
		{ language: 'json', scheme: 'file' },
		{ language: 'json', scheme: 'untitled' },
		{ language: 'plaintext', scheme: 'file' },
		{ language: 'plaintext', scheme: 'untitled' },
	];

	context.subscriptions.push(
		// commands
		vscode.commands.registerCommand('jq-vscode.openjq', openjq),

		// codeLens
		vscode.languages.registerCodeLensProvider(selectors, new RootCodeLensProvider()),

		// services
		initServices()
	);

	functionsCompletion.then((completions: vscode.CompletionItemProvider) =>
		context.subscriptions.push(
			// completions
			vscode.languages.registerCompletionItemProvider(selectors, completions),
		)
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }
