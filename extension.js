const vscode = require("vscode");
const CoffeeScript = require("coffeescript");
const vm = require("vm");

const DEFAULT_EDITOR_OPTIONS = {
	i: 0,
	j: 0,
	n: 0,
	x: 0,
	y: 0,
	z: 0,
	PI: Math.PI,
	E: Math.E,
	a: "",
	s: "",
	random: Math.random,
	randomInt: (min, max) => ((min = Math.ceil(min)), (max = Math.floor(max)), Math.floor(Math.random() * (max - min + 1)) + min),
	pow: Math.pow,
	sqrt: Math.sqrt,
	abs: Math.abs,
	sin: Math.sin,
	cos: Math.cos,
	tan: Math.tan,
	floor: Math.floor,
	ceil: Math.ceil,
	round: Math.round,
	$prev: ""
};

function indentOf(x) {
	return x.substr(0, x.indexOf(x.trim()));
}

function compareSelection(a, b) {
	if (a.start.line < b.start.line) {
		return -1;
	}
	if (a.start.line > b.start.line) {
		return 1;
	}
	if (a.start.character < b.start.character) {
		return -1;
	}
	if (a.start.character > b.start.character) {
		return 1;
	}
	return 0;
}

function runJS(code, context) {
	try {
		const RESULT = vm.runInNewContext(`${code.replace(/\\/g, "\\\\").replace(/\$\{.+?\}/g, "\\$&").replace(/\`/g, "\\`")}`, context, {timeout: 1000});
		context.$prev = RESULT;
		return {
			result: RESULT,
			context: context
		};
	} catch (error) {
		throw error.toString();
	}
}

function runCoffee(code, context) {
	try {
		code = coffeeToJs(code);
		return runJS(code, context);
	} catch (err) {
		logError(err, "compiling coffeescript");
		throw {coffeeCompileError: true};
	}
}

function coffeeToJs(code) {
	return CoffeeScript.compile(code).replace(/^\s*\(function\(\)\s*\{/, "").replace(/\}\)\.call\(this\);\s*$/, "").trim();
}

function logError(message, when = "executing javascript") {
	message = message.toString();
	vscode.window.showErrorMessage(`Error when ${when}: ${message}`);
}

function format(input) {
	switch (typeof input) {
		case "object":
			return JSON.stringify(input);
		case "undefined":
			return "undefined";
		case "function":
			return input.toString();
		case "symbol":
			return input.toString();
		default:
			return input;
	}
}

function codeEvaluator(evaluateMethod) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage("Use an editor!");
		return;
	}

	let selections = editor.selections;
	if (selections.map(selection => editor.document.getText(selection)).join("") === "") return;

	selections.sort(compareSelection);

	editor.edit(builder => {
		let context = {
			...DEFAULT_EDITOR_OPTIONS
		};
		const Start = Date.now();
		for (const selection of selections) {
			const text = editor.document.getText(selection);
			if (text === "") continue;
			const lines = text.split("\n");
			try {
				builder.replace(selection, 	indentOf(text) + lines.map(function(line) {
					if (line === "") return "";
					const CODE_RESULT = evaluateMethod(line, context);
					context = CODE_RESULT.context;
					DEFAULT_EDITOR_OPTIONS.$prev = CODE_RESULT.result;
					return format(CODE_RESULT.result);
				}).join("\n"));
			} catch (error) {
				if (error.coffeeCompileError) {
					if (vscode.workspace.getConfiguration('eval-and-replace')["force-replace"]) builder.replace(selection, indentOf(text));
					return;
				}
				try {
					const CODE_RESULT = evaluateMethod(lines.join("\n"), context);
					DEFAULT_EDITOR_OPTIONS.$prev = CODE_RESULT.result;
					builder.replace(selection, indentOf(text) + format(CODE_RESULT.result));
				} catch (e) {
					logError(e);
					if (vscode.workspace.getConfiguration('eval-and-replace')["force-replace"]) builder.replace(selection, indentOf(text));
					return;
				}
			}
		}
		if (vscode.workspace.getConfiguration('eval-and-replace')["debug-time"]) vscode.window.showInformationMessage(`Execution time: ${Date.now() - Start} MS`);
	});
}

function activate(context) {
	const eval_javascript = vscode.commands.registerCommand("eval-and-replace.eval-javascript", () => codeEvaluator(runJS));
	const eval_coffeescript = vscode.commands.registerCommand("eval-and-replace.eval-coffeescript", () => codeEvaluator(runCoffee));
	context.subscriptions.push(eval_javascript);
	context.subscriptions.push(eval_coffeescript);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
};
