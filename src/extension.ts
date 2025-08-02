import vm from "node:vm";
import { inspect } from "node:util";
import { commands, type ExtensionContext, Selection, window, workspace } from "vscode";

const display = (x: unknown): string => {
	if (x === undefined) return "undefined";
	if (x === null) return "null";

	const config = workspace.getConfiguration("eval-and-replace");

	switch (typeof x) {
		case "object":
		case "boolean":
		case "number":
			return inspect(x, {
				depth: Infinity,
				colors: false,
				maxArrayLength: Infinity,
				maxStringLength: Infinity,
				breakLength: Infinity,
				compact: config.get<boolean>("compact") ?? true
			});

		case "string":
			if (config.get("escapeStrings"))
				return JSON.stringify(x);

		case "function":
		default:
			return String(x);
	}
};

const stringifyError = (error: unknown): string => {
	if (!workspace.getConfiguration("eval-and-replace").get("showErrorStacks")) {
		try {
			// @ts-expect-error
			return error.toString();
		} catch {
		}
	}

	return display(error);
};

const handleError = (when: string, error: unknown) => {
	window.showErrorMessage(`Error while ${when}: ${stringifyError(error)}`);
	console.error(error);
};

const evalAndReplaceJS = () => {
	const editor = window.activeTextEditor;
	if (!editor) {
		window.showErrorMessage("Eval and replace: No active editor");
		return;
	}

	const config = workspace.getConfiguration("eval-and-replace");
	const timeout = config.get<number>("timeout") ?? 1000;
	if (timeout < 1 || timeout > 4294967295) {
		window.showErrorMessage("Eval and replace: Timeout must be between 1 and 4,294,967,295");
		return;
	}

	const context = vm.createContext({
		i: 0, j: 0, n: 0, x: 0, y: 0, z: 0,
		...Object.fromEntries(Object.getOwnPropertyNames(Math).map(k => [k, Math[k as keyof Math]])),
		a: "", s: "",

		randomInt: (min_: number, max_: number) => {
			const min = Math.ceil(min_);
			const max = Math.floor(max_);
			return Math.floor(Math.random() * (max - min + 1)) + min;
		},

		$prev: ""
	});

	try {
		const preinitializedScript = config.get<string>("preinitializedScript") ?? "";
		if (preinitializedScript.trim().length > 0) vm.runInContext(preinitializedScript, context, { timeout });
	} catch (error) {
		handleError("evaluating pre-initialized script", error);
		return;
	}

	const selections = editor.selections.slice();

	if (selections.length === 1 && selections[0].isEmpty) {
		const line = editor.document.lineAt(selections[0].start.line);
		selections[0] = new Selection(line.range.start, line.range.end);
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

				const result = vm.runInContext(text, context, { timeout });

				context.$prev = result;
				editBuilder.replace(selection, display(result));
			}
		} catch (error) {
			handleError("evaluating selection", error);
			return;
		}
	});
};

export const activate = (context: ExtensionContext) => {
	const c = commands.registerCommand("eval-and-replace.eval-javascript", evalAndReplaceJS);
	context.subscriptions.push(c);
};