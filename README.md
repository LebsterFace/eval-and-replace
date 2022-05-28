# Eval and Replace

Execute JavaScript code and replace the code with the result

[Original atom plugin](https://atom.io/packages/eval-and-replace)

[Get the extension](https://marketplace.visualstudio.com/items?itemName=Lebster.eval-and-replace)

## Demo

![Demonstration Gif](images/demo.gif)

## Usage
You can execute any JavaScript code by first selecting it and then running `Eval and Replace: JS` from the command palette (or by selecting it and using the default keybinding, <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>J</kbd>)

## Multiple selections & pre-initialized values
You can evaluate multiple expressions selected seperately, and each will be replaced seperately, however: the same context is used for all selections, so you can reuse
variables.

Additionally you have access to these pre-initialized global functions and variables:

* `i`, `j`, `n`, `x`, `y`, `z`: initialized with `0`
* `a`, `s`: initialized with `''`
* `PI`: Alias for `Math.PI` (etc. for other `Math` properties & methods)
* `randomInt(min: number, max: number)`: generates a random integer between `min` and `max` (inclusive of both)

If you have any questions / concerns about this extension, reach out to me on Discord at `Lebster#0617`

## Change Log

## [2.0.0] - 2022-05-28
### Changed
 - Only one replacement is made per selection. If multiple lines are included in one selection, the entire selection is evaluated and then replaced with the value of the final line. To mimic the old behaviour, create one selection for each line.
 - Certain types (e.g. `bigint`) now have special rules when being inserted as a replacement.
### Removed
 - Removed CoffeeScript support entirely.
 - Removed both configuration options
### Fixed
 - Template literals can now be evaluated

## [1.0.0] - 2020-08-17

- Initial Release

**Enjoy!**