# Cypress Autorecorder

Cypress Autorecorder is a plugin built to be used with Cypress.io. It simplifies mocking by auto-recording/stubbing HTTP interactions and automate the process of updating/deleting recordings. Spend more time writing integration tests instead of managing your mock data.

### Getting Started

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
  autoRecord(__filename); // Call the autoRecord function at the beginning of your describe block and pass in `__filename`
  
  // Your hooks (beforeEach, afterEach, etc) goes here
  
  it('...', function() { // Do not use arrow functions
    // Your test goes here
  });
});
```

**_NOTE: Do not use ES6 arrow functions for your describe or it callback. This will cause the recording function to break._**

That is it! Now, just run your tests and the auto-recorder will take care of the rest!

### Updating Mocks

In the case you need to update your mocks for a particular test:
```js
const autoRecord = require('cypress-autorecord');
  
describe('Home Page', function() {
  autoRecord(__filename);
  
  it('[r] my awesome test', function() { // Insert [r] at the beginning of your test name
    // ...
  });
});
```
This will force the test to record over your existent mocks for**ONLY**this test.
