import * as vscode from "vscode";
import { VM } from "vm2";

const display = (x: unknown): string => {
	if (x === undefined) return "undefined";

	switch (typeof x) {
		case "bigint": return x.toString() + "n";

		case "function":
		case "symbol":
			return x.toString();

		case "object":
			if (x instanceof Error || x instanceof RegExp)
				return x.toString();
		case "boolean":
		case "number":
			return JSON.stringify(x);

		case "string":
			if (vscode.workspace.getConfiguration('eval-and-replace').get('escapeStrings'))
				return JSON.stringify(x);

		default:
			return x + "";
	}
};

const main = () => {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage("Eval and replace: No active editor");
		return;
	}

	const vm = new VM({
		timeout: 1000,
		sandbox: {
			i: 0, j: 0, n: 0, x: 0, y: 0, z: 0,
			...Object.fromEntries(Object.getOwnPropertyNames(Math).map(k => [k, Math[k as keyof Math]])),
			a: "", s: "",

			randomInt: (min_: number, max_: number) => {
				const min = Math.ceil(min_);
				const max = Math.floor(max_);
				return Math.floor(Math.random() * (max - min + 1)) + min;
			},

			$prev: ""
		}
	});

	const selections = editor.selections.slice();

	if (selections.length === 1 && selections[0].isEmpty) {
		const line = editor.document.lineAt(selections[0].start.line);
		selections[0] = new vscode.Selection(line.range.start, line.range.end);
	}

	const sortedSelections = selections.sort((a, b) => {
		if (a.start.line < b.start.line) return -1;
		if (a.start.line > b.start.line) return 1;
		if (a.start.character < b.start.character) return -1;
		if (a.start.character > b.start.character) return 1;
		return 0;
	});

	editor.edit(editBuilder => {
		try {
			for (const selection of sortedSelections) {
				const text = editor.document.getText(selection);
				if (text.trim() === "") continue;

				const result = vm.run(text);
				vm.setGlobal("$prev", result);
				editBuilder.replace(selection, display(result));
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Error while evaluating: ${display(error)}`);
			console.error(error);
			return;
		}
	});
};

export const activate = (context: vscode.ExtensionContext) => {
	const c = vscode.commands.registerCommand("eval-and-replace.eval-javascript", main);
	context.subscriptions.push(c);
};

export const deactivate = () => { };