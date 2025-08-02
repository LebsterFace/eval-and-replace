# Change Log

All notable changes to the "eval-and-replace" extension will be documented in this file.

## \[3.0.0] - 2025-08-02
### Added
 - The option `eval-and-replace.showErrorStacks` dictates whether full error stack traces should be shown
 - The option `eval-and-replace.preinitializedScript` allows users to provide custom code to run before selections are evaluated, e.g. to initialize custom variables and functions
 - The option `eval-and-replace.compact` dictates whether results are formatted on a single line
 - The option `eval-and-replace.timeout` allows the evaluation timeout to be controlled
### Changed
 - Results are now formatted using Node's `util.inspect`
### Fixed
 - More built-in objects can be correctly displayed as the outputs of evaluations
## \[2.4.0] - 2025-02-10
### Added
 - Ability to evaluate the current line without having to select it first
## \[2.3.0] - 2023-02-07
### Added
 - The option `eval-and-replace.escapeStrings` dictates whether strings should be passed to JSON.stringify
## \[2.0.0] - 2022-05-28
### Changed
 - Only one replacement is made per selection. If multiple lines are included in one selection, the entire selection is evaluated and then replaced with the value of the final line. To mimic the old behaviour, create one selection for each line.
 - Certain types (e.g. `bigint`) now have special rules when being inserted as a replacement.
### Removed
 - Removed CoffeeScript support entirely.
 - Removed both configuration options
### Fixed
 - Template literals can now be evaluated
## \[1.0.0] - 2020-08-17
 - Initial Release