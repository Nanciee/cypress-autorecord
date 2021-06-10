# Changelog
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
## [3.1.1] - 2021-06-10
### Fixed
- Fix crash when loading request stored in a fixture [[lefta](https://github.com/lefta)]
## [3.1.0] - 2021-05-26
### Added
- Config `interceptPattern` which allows you to specify which endpoints you want to listen and mock [[Ika-x](https://github.com/Ika-x)]
### Fixed
- Sending request to actual server instead of mocking, resolving issues [#51](https://github.com/Nanciee/cypress-autorecord/issues/51) [[Ika-x](https://github.com/Ika-x)]
## [3.0.0] - 2021-05-05
### Changed
- __[BREAKING CHANGE]__ Replace the underlying mechanism for stubbing and mocking to align with Cypress' new API in v6.x and v7.x  [[mhssmnn](https://github.com/mhssmnn)]
### Fixed
- Restore cy.clock in the beforeEach to allow specs to continue running [[ha404](https://github.com/ha404)]

## [2.0.1] - 2021-01-14
### Fixed
- `Fetch()` 'get' requests no longer breaks tests when running with the recorded mocks, resolving issue [#40](https://github.com/Nanciee/cypress-autorecord/issues/40)

## [2.0.0] - 2020-09-18

### Added
- __[BREAKING CHANGE]__ Organize fixtures by spec [[bautistaaa](https://github.com/bautistaaa)]
- Use cy.now(...) to insert new stubbed route [[bebop23](https://github.com/bebop23)]
- Add timestamp to tests so browser is brought back to the time where the mocks live [[bebop23](https://github.com/bebop23)]
- Add new stub when response data changes [[bebop23](https://github.com/bebop23)]
### Fixed
- Convert blob responses to plain text so it can be properly recorded, resolving issues [#7](https://github.com/Nanciee/cypress-autorecord/issues/7) and [#22](https://github.com/Nanciee/cypress-autorecord/issues/22) [[lcnandre](https://github.com/lcnandre)]
- Resolve cypress 5.x incompatibility, resolving issue [#34](https://github.com/Nanciee/cypress-autorecord/issues/34) [[jrocketfingers](https://github.com/jrocketfingers)]

## [1.1.1] - 2019-07-22
### Fixed
- Only record if the request coming in doesn't have a matching URL, METHOD, and BODY, resolving issue [#5](https://github.com/Nanciee/cypress-autorecord/issues/5) [[bautistaaa](https://github.com/bautistaaa)]

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


