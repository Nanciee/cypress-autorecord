# Changelog
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2019-07-22
### Added
- Feature for recording HEAD requests [[alejo90](https://github.com/alejo90)]
- `index.d.ts` to remove Typescript compiler warning [[alejo90](https://github.com/alejo90)]
- Feature for storing a set of whitelisted headers [[alejo90](https://github.com/alejo90)]
- CHANGELOG.md
### Changed
- README.md is updated to reflect changes
## Removed
- Remove the need to pass in `__filename` when calling `autoRecord()` [[alejo90](https://github.com/alejo90)]
## Fixed
- All requests that has the same url and methods but different request bodies no longer just return the last request body

## [1.0.13] - 2019-07-20
### Added
- Feature for recording PUT requests [[chauey](https://github.com/chauey)]
### Changed
- README.md now includes the "Known Issues" section

## [1.0.12] - 2019-04-21
### Fixed
- Filename for mocks copies entire test name minus the extension [[fraserxu](https://github.com/fraserxu)]

## [1.0.11] - 2019-04-11
### Fixed
- Test cases using global asserts

## [1.0.10] - 2019-04-01
### Changed
- README.md now include the "How It Works" section

## [1.0.9] - 2019-03-31
### Added
- README.md explaining current features
### Fixed
- POST requests that has the same url but different request bodies no longer just return the last request body 

## [1.0.8] - 2019-03-27
### Added
- Feature to auto record and stub xhr requests
- Feature to update mocks by inserting [r] in the name of the test
- Feature to clean mocks
- Feature to blacklist routes and prevent it from being recorded


