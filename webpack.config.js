const path = require("path");
module.exports = {
	target: "node",
	mode: "production",
	entry: "./src/extension.js",
	output: {
		filename: "main.js",
		path: path.resolve(__dirname, "dist"),
		libraryTarget: "commonjs2",
		devtoolModuleFilenameTemplate: "../[resource-path]"
	},
	externals: {
		vscode: "commonjs vscode"
	},
	resolve: {
		extensions: [".js"]
	}
};
