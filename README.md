# Cypress Autorecord

Cypress Autorecord is a plugin built to be used with Cypress.io. It simplifies mocking by auto-recording/stubbing HTTP interactions and automating the process of updating/deleting recordings. Spend more time writing integration tests instead of managing your mock data.

## Getting Started

Install from npm

```
npm install --save-dev cypress-autorecord
```

Add this snippet in your project's `/cypress/plugins/index.js`

```js
const fs = require('fs');
const autoRecord = require('cypress-autorecord/plugin');

module.exports = (on, config) => {
  autoRecord(on, config, fs);
};
```
To allow for auto-recording and stubbing to work, require cypress-autorecord in each of your test file and call the function at the beginning of your parent `describe` block.

```js
const autoRecord = require('cypress-autorecord'); // Require the autorecord function
  
describe('Home Page', function() { // Do not use arrow functions
  autoRecord(); // Call the autoRecord function at the beginning of your describe block
  
  // Your hooks (beforeEach, afterEach, etc) goes here
  
  it('...', function() { // Do not use arrow functions
    // Your test goes here
  });
});
```

**_NOTE: Do not use ES6 arrow functions for your describe or it callback. This will cause the recording function to break._**

That is it! Now, just run your tests and the auto-record will take care of the rest!

## Updating Mocks

In the case you need to update your mocks for a particular test:
```js
const autoRecord = require('cypress-autorecord');
  
describe('Home Page', function() {
  autoRecord();
  
  it('[r] my awesome test', function() { // Insert [r] at the beginning of your test name
    // ...
  });
});
```
This will force the test to record over your existent mocks for **ONLY** this test on your next run.

This can also be done through the configurations by adding the test name in the file `cypress.json`:

```json
{
  "autorecord": {
    "recordTests": ["my awesome test"]
  }
}
```

Alternatively, you can update recordings for all tests by setting `forceRecord` to `true` before rerunning your tests:

```json
{
  "autorecord": {
    "forceRecord": true
  }
}
```

## Removing Stale Mocks

Stale mocks that are no longer being used can be automatically removed when you run your tests by setting `cleanMocks` to `true` in the file `cypress.json`:

```json
{
  "autorecord": {
    "cleanMocks": true
  }
}
```

**_NOTE: Only mocks that are used during the run are considered "active". Make sure to only set `cleanMocks` to `true` when you are running ALL your tests. Remove any unintentional `.only` or `.skip`._**

## How It Works

### How does the recording and stubbing work?
Cypress Autorecord uses Cypress' built-in `cy.server` to hook into every request, including GET, POST, DELETE and PUT. If mocks doesn't exist for a test, the http calls (requests and responses) are captured and automatically written to a local file. If mocks exist for a test, each http call will be stubbed by using `cy.route` in the `beforeEach` hook.

### Where are the mocks saved?
The mocks will be automatically generated and saved in the `/cypress/mocks/` folder. Mocks are grouped by test name and test file name. You will find mock files matching the name of your test files. Within your mock files, mocks are organized by test names in the order that they were called. Changing the test file name or test name will result to a disconnection to the mocks and trigger a recording on your next run.

#### Create unique mock responses files

If json files are getting too large or more granularity is needed. Then specify seperateMockFiles in cypress.json:

```json
{
  "autorecord": {
    "seperateMockFiles": true
  }
}
```

For every unique request there will be a json file generated in `/cypress/fixtures` folder. Requests are put into subfolders by request domain name. Every GET request with same pathname and query is considered same. For every other method types, request body and response objects are hashed. If same object always gets same hash.

### Can I manually update the mocks?
Mocks are saved as a simple json object and can be updated manually. This is **not** recommended since any manual change you make will be overwritten when you automatically update the mocks. Leave the data management to cypress-autorecord. Make any modifications to the http calls inside your test so that it will be consistent across recordings.

```js
it('should display an error message when send message fails', function() {
  cy.route({
    url: '/message',
    method: 'POST',
    status: 404,
    response: { error: 'It did not work' },
  });

  cy.get('[data-cy="msgInput"]').type('Hello World!');
  cy.get('[data-cy="msgSend"]').click();
  cy.get('[data-cy="errorMessage"]').should('contain', 'Looks like we ran into a problem. Please try again.');
});
```

## Known Issues

#### Uncaught CypressError appears for certain requests
You should only ever see this error when you have a test that calls the same url but expect different response bodies based on different request bodies. The error message will show up when your test fails but **this error does not effect your mocks or tests in any way and is not causing your test to fail!** If you are curious to know a little bit more, take a look [here](https://github.com/Nanciee/cypress-autorecord/issues/5#issuecomment-508616149).

#### Only XMLHttpRequests will be recorded and stubbed
Cypress-autorecord leverages Cypress' built in `cy.route` to handle stubbing, which means that it inherits some limitations as well. This is the disclaimer on the `cy.route` documentation page with some potential workarounds:
>Please be aware that Cypress only currently supports intercepting XMLHttpRequests. Requests using the Fetch API and other types of network requests like page loads and <script> tags will not be intercepted or visible in the Command Log. See [#95](https://github.com/cypress-io/cypress/issues/95) for more details and temporary workarounds.

## Contributions
I would really appreciate any help with bug fixes or any new features you think might be relevant! Feel free to submit a PR!