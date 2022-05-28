import * as vscode from "vscode";

export const activate = (context: vscode.ExtensionContext) => {
	console.log('Congratulations, your extension "eval-and-replace" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand("eval-and-replace.helloWorld", () => {
		vscode.window.showInformationMessage("Hello World from Eval and Replace!");
	}));
};

export const deactivate = () => { };