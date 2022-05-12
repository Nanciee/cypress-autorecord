'use strict';
const path = require('path');
const util = require('./util');

const guidGenerator = util.guidGenerator;
const sizeInMbytes = util.sizeInMbytes;
const blobToPlain = util.blobToPlain;
const replaceUrlsWithServiceEnvVars = util.replaceUrlsWithServiceEnvVars;
const replaceServiceEnvVarsWithUrls = util.replaceServiceEnvVarsWithUrls;

const cypressConfig = Cypress.config('autorecord') || {};
const isCleanMocks = cypressConfig.cleanMocks || false;
const isForceRecord = cypressConfig.forceRecord || false;
const recordTests = cypressConfig.recordTests || [];
const serviceEnvVars = cypressConfig.serviceEnvVars || [];
const blacklistRoutes = cypressConfig.blacklistRoutes || [];

let interceptPattern = cypressConfig.interceptPattern || '*';
const interceptPatternFragments =
  interceptPattern.match(/\/(.*?)\/([a-z]*)?$/i);
if (interceptPatternFragments) {
  interceptPattern = new RegExp(
    interceptPatternFragments[1],
    interceptPatternFragments[2] || ""
  );
}

const whitelistHeaders = cypressConfig.whitelistHeaders || [];
const maxInlineResponseSize = cypressConfig.maxInlineResponseSize || 70;
const supportedMethods = ['get', 'GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];

const fileName = path.basename(
    Cypress.spec.name,
    path.extname(Cypress.spec.name),
);
// The replace fixes Windows path handling
const fixturesFolder = Cypress.config('fixturesFolder').replace(/\\/g, '/');
const fixturesFolderSubDirectory = fileName.replace(/\./, '-');
const mocksFolder = path.join(fixturesFolder, '../mocks');

before(function() {
  if (isCleanMocks) {
    cy.task('cleanMocks');
  }

  if (isForceRecord) {
    cy.task('removeAllMocks');
  }
});

module.exports = function autoRecord() {
  const whitelistHeaderRegexes = whitelistHeaders.map((str) => RegExp(str));

  // For cleaning, to store the test names that are active per file
  const testNames = [];
  // For cleaning, to store the clean mocks per file
  const cleanMockData = {};
  // Locally stores all mock data for this spec file
  let routesByTestId = {};
  // For recording, stores data recorded from hitting the real endpoints
  let routes = [];
  // Stores any fixtures that need to be added
  const addFixture = {};
  // Stores any fixtures that need to be removed
  const removeFixture = [];
  // For force recording, check to see if [r] is present in the test title
  let isTestForceRecord = false;
  // Timestamp for when this test was executed
  let timestamp = null;

  before(function() {
    // Get mock data that relates to this spec file
    cy.task('readFile', path.join(mocksFolder, `${fileName}.json`)).then((data) => {
      routesByTestId = data === null ? {} : data;
    });
  });

  beforeEach(function() {
    // Reset routes before each test case
    routes = [];

    cy.intercept(interceptPattern, (req) => {
      // This is cypress loading the page
      if (
        Object.keys(req.headers).some((k) => k === 'x-cypress-authorization')
      ) {
        return;
      }

      req.reply((res) => {
        const url = req.url;
        const status = res.statusCode;
        const method = req.method;
        const data =
          res.body.constructor.name === 'Blob'
            ? blobToPlain(res.body)
            : res.body;
        const body = req.body;
        const headers = Object.entries(res.headers)
          .filter(([key]) =>
            whitelistHeaderRegexes.some((regex) => regex.test(key)),
          )
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

        // We push a new entry into the routes array
        // Do not rerecord duplicate requests
        if (
          !routes.some(
            (route) =>
              route.url === url &&
              route.body === body &&
              route.method === method &&
              // when the response has changed for an identical request signature
              // add this entry as well.  This is useful for polling-oriented endpoints
              // that can have varying responses.
              route.response === data,
          )
        ) {
          routes.push({ url, method, status, data, body, headers });
        }
      });
    });

    // check to see if test is being force recorded
    // TODO: change this to regex so it only reads from the beginning of the string
    isTestForceRecord = this.currentTest.title.includes('[r]');
    this.currentTest.title = isTestForceRecord ? this.currentTest.title.split('[r]')[1].trim() : this.currentTest.title;

    // Load stubbed data from local JSON file
    // Do not stub if...
    // This test is being force recorded
    // there are no mock data for this test
    if (
      !recordTests.includes(this.currentTest.title)
      && !isTestForceRecord
      && routesByTestId[this.currentTest.title]
    ) {
      // This is used to group routes by method type and url (e.g. { GET: { '/api/messages': {...} }})
      const sortedRoutes = {};
      supportedMethods.forEach((method) => {
        sortedRoutes[method] = {};
      });

      // set the browser's Date to the timestamp at which this spec's endpoints were recorded.
      cy.clock(routesByTestId[this.currentTest.title].timestamp, ['Date']);

      routesByTestId[this.currentTest.title].routes.forEach((request) => {
        if (!sortedRoutes[request.method][request.url]) {
          sortedRoutes[request.method][request.url] = [];
        }

        sortedRoutes[request.method][request.url].push(request);
      });

      const createStubbedRoute = (method, url) => {
        let index = 0;
        const response = sortedRoutes[method][url][index];

        cy.intercept(
          {
            url: replaceServiceEnvVarsWithUrls(url, serviceEnvVars),
            method,
          },
          (req) => {
            const newResponse = sortedRoutes[method][url][index];
            req.reply({
              headers: newResponse.headers,
              statusCode: newResponse.status,
              body: newResponse.response ? newResponse.response : null,
              fixture: newResponse.fixtureId ? `${fixturesFolderSubDirectory}/${newResponse.fixtureId}.json` : null,
            });
            if (sortedRoutes[method][url].length > index + 1) {
              index++;
            }
          },
        );
      };

      // Stub all recorded routes
      Object.keys(sortedRoutes).forEach((method) => {
        Object.keys(sortedRoutes[method]).forEach((url) => createStubbedRoute(method, url));
      });
    } else {
      // lock the browser's timestamp in place so that there is no variation with the
      // timestamp REST APIs use as an argument due to undeterministic page load times
      // which will cause varying timestamps.  `cy.clock` locks the timestamp.
      timestamp = Date.now();
      cy.clock(timestamp, ['Date']);
    }

    // Store test name if isCleanMocks is true
    if (isCleanMocks) {
      testNames.push(this.currentTest.title);
    }

    cy.clock().invoke('restore');
  });

  afterEach(function() {
    // Check to see if the current test already has mock data or if forceRecord is on
    if (
      (!routesByTestId[this.currentTest.title]
      || isTestForceRecord
      || recordTests.includes(this.currentTest.title))
      && !isCleanMocks
    ) {
      // Construct endpoint to be saved locally
      const endpoints = routes.map((request) => {
        // Check to see of mock data is too large for request header
        const isFileOversized = sizeInMbytes(request.data) > maxInlineResponseSize;
        let fixtureId;

        // If the mock data is too large, store it in a separate json
        if (isFileOversized) {
          fixtureId = guidGenerator();
          addFixture[path.join(fixturesFolder, fixturesFolderSubDirectory, `${fixtureId}.json`)] = request.data;
        }

        return {
          fixtureId: fixtureId,
          url: replaceUrlsWithServiceEnvVars(request.url, serviceEnvVars),
          method: request.method,
          status: request.status,
          headers: request.headers,
          body: request.body,
          response: isFileOversized ? undefined : request.data
        };
      });

      // Delete fixtures if we are overwriting mock data
      if (routesByTestId[this.currentTest.title]) {
        routesByTestId[this.currentTest.title].routes.forEach((route) => {
          // If fixtureId exist, delete the json
          if (route.fixtureId) {
            removeFixture.push(path.join(fixturesFolder, fixturesFolderSubDirectory, `${route.fixtureId}.json`));
          }
        });
      }

      // Store the endpoint for this test in the mock data object for this file if there are endpoints for this test
      if (endpoints.length > 0) {
        routesByTestId[this.currentTest.title] = {
          // since REST APIs can pass a timestamp argument, we need to keep track
          // of the time at which this spec was recorded so we can set the browser's Date
          // to that specific time so that the endpoints can be properly stubbed as the
          // the timestamp is part of many of the APIs' signature as well as POST body and uniquely identifies it.
          timestamp,
          routes: endpoints
        };
      }
    }
  });

  after(function() {
    // Transfer used mock data to new object to be stored locally
    if (isCleanMocks) {
      Object.keys(routesByTestId).forEach((testName) => {
        if (testNames.includes(testName)) {
          cleanMockData[testName] = routesByTestId[testName];
        } else {
          routesByTestId[testName].routes.forEach((route) => {
            if (route.fixtureId) {
              cy.task('deleteFile', path.join(fixturesFolder, fixturesFolderSubDirectory, `${route.fixtureId}.json`));
            }
          });
        }
      });
    }

    removeFixture.forEach((fixtureName) => cy.task('deleteFile', fixtureName));
    cy.writeFile(path.join(mocksFolder, `${fileName}.json`), isCleanMocks ? cleanMockData : routesByTestId);
    Object.keys(addFixture).forEach((fixtureName) => {
      cy.writeFile(fixtureName, addFixture[fixtureName]);
    });
  });
};
