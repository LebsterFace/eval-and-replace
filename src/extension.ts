import * as vscode from "vscode";
import { VM } from "vm2";

const display = (x: unknown): string => {
	if (x === undefined) return "undefined";

	switch (typeof x) {
		case "bigint": return x.toString() + "n";
		case "string": return x;

		case "boolean":
		case "function":
		case "number":
		case "symbol":
			return x.toString();

		case "object": {
			if (x === null) return "null";
			if (Array.isArray(x)) return `[${x.map(display).join(", ")}]`;
			if (x instanceof Error ||
				x instanceof RegExp
			) return x.toString();

			return JSON.stringify(x);
		}

		default: return x + "";
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

	const sortedSelections = editor.selections.slice().sort((a, b) => {
		if (a.start.line < b.start.line) return -1;
		if (a.start.line > b.start.line) return 1;
		if (a.start.character < b.start.character) return -1;
		if (a.start.character > b.start.character) return 1;
		return 0;
	});

	editor.edit(editBuilder => {
		try {
			for (const selection of sortedSelections) {
				const result = vm.run(editor.document.getText(selection));
				vm.setGlobal("$prev", result);
				editBuilder.replace(selection, display(result));
			}
		} catch (error) {
			vscode.window.showErrorMessage(`Error while evaluating: ${display(error)}`);
			return;
		}
	});
};

export const activate = (context: vscode.ExtensionContext) => {
	const c = vscode.commands.registerCommand("eval-and-replace.eval-javascript", main);
	context.subscriptions.push(c);
};

export const deactivate = () => { };