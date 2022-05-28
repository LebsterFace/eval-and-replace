# Change Log

All notable changes to the "eval-and-replace" extension will be documented in this file.

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