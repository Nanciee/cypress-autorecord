'use strict';
const path = require('path');
const util = require('./util');

const guidGenerator = util.guidGenerator;
const sizeInMbytes = util.sizeInMbytes;

const cypressConfig = Cypress.config('autorecord') || {};
const isCleanMocks = cypressConfig.cleanMocks || false;
const isForceRecord = cypressConfig.forceRecord || false;
const recordTests = cypressConfig.recordTests || [];
const blacklistRoutes = cypressConfig.blacklistRoutes || [];
const whitelistHeaders = cypressConfig.whitelistHeaders || [];

const fileName = path.basename(
  Cypress.spec.name,
  path.extname(Cypress.spec.name),
);
// The replace fixes Windows path handling
const fixturesFolder = Cypress.config('fixturesFolder').replace(/\\/g, '/');
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
  const whitelistHeaderRegexes = whitelistHeaders.map(str => RegExp(str));

  // For cleaning, to store the test names that are active per file
  let testNames = [];
  // For cleaning, to store the clean mocks per file
  let cleanMockData = {};
  // Locally stores all mock data for this spec file
  let routesByTestId = {};
  // For recording, stores data recorded from hitting the real endpoints
  let routes = [];
  // Stores any fixtures that need to be added
  let addFixture = {};
  // Stores any fixtures that need to be removed
  let removeFixture = [];
  // For force recording, check to see if [r] is present in the test title
  let isTestForceRecord = false;

  before(function() {
    // Get mock data that relates to this spec file
    cy.task('readFile', path.join(mocksFolder, `${fileName}.json`)).then(data => {
      routesByTestId = data === null ? {} : data;
    });
  });

  beforeEach(function() {
    // Reset routes before each test case
    routes = [];

    cy.server({
      // Filter out blacklisted routes from being recorded and logged
      whitelist: xhr => {
        if(xhr.url) {
          // TODO: Use blobs
          return blacklistRoutes.some(route => xhr.url.includes(route));
        }
      },
      // Here we handle all requests passing through Cypress' server
      onResponse: response => {
        const url = response.url;
        const status = response.status;
        const method = response.method;
        const data = response.response.body;
        const body = response.request.body;
        const headers = Object.entries(response.response.headers)
          .filter(([key]) => whitelistHeaderRegexes.some(regex => regex.test(key)))
          .reduce((obj, [key, value]) => ({...obj, [key]: value}), {});

        // We push a new entry into the routes array
        routes.push({ url, method, status, data, body, headers });
      },
      // Disable all routes that are not mocked
      force404: true,
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
      const sortedRoutes = {};
      cy.server({
        force404: true,
      });

      routesByTestId[this.currentTest.title].forEach((request) => {
        if (request.body) {
          if (!sortedRoutes[request.url]) {
            sortedRoutes[request.url] = [];
          }

          sortedRoutes[request.url].push(request);
        } else {
          cy.route({
            method: request.method,
            url: request.url,
            status: request.status,
            headers: request.headers,
            response: request.fixtureId ? `fixture:${request.fixtureId}.json` : request.response,
          });
        }
      });

      // This handles requests from the same url but with different request bodies
      const onResponse = (url, index) => {
        if (sortedRoutes[url].length > index) {
          const response = sortedRoutes[url][index];
          cy.route({
            method: response.method,
            url: url,
            status: response.status,
            headers: response.headers,
            response: response.fixtureId ? `fixture:${response.fixtureId}.json` : response.response,
            onResponse: () => onResponse(url, index + 1),
          });
        }
      };

      Object.keys(sortedRoutes).forEach(url => onResponse(url, 0))
    } else {
      // Allow all routes to go through
      cy.server({ force404: false });
      // This tells Cypress to hook into all types of requests
      cy.route({
        method: 'GET',
        url: '*',
      });

      cy.route({
        method: 'POST',
        url: '*',
      });

      cy.route({
        method: 'PUT',
        url: '*',
      });

      cy.route({
        method: 'DELETE',
        url: '*',
      });

      cy.route({
        method: 'PATCH',
        url: '*',
      });

      cy.route({
        method: 'HEAD',
        url: '*',
      });
    }

    // Store test name if isCleanMocks is true
    if (isCleanMocks) {
      testNames.push(this.currentTest.title);
    }
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
        const isFileOversized = sizeInMbytes(request.data) > 70;
        let fixtureId;

        // If the mock data is too large, store it in a separate json
        if (isFileOversized) {
          fixtureId = guidGenerator();
          addFixture[path.join(fixturesFolder, `${fixtureId}.json`)] = request.data;
        }

        return {
          fixtureId: fixtureId,
          url: request.url,
          method: request.method,
          status: request.status,
          headers: request.headers,
          body: request.body,
          response: isFileOversized ? undefined : request.data,
        };
      });

      // Delete fixtures if we are overwriting mock data
      if (routesByTestId[this.currentTest.title]) {
        routesByTestId[this.currentTest.title].forEach((route) => {
          // If fixtureId exist, delete the json
          if (route.fixtureId) {
            removeFixture.push(path.join(fixturesFolder, `${route.fixtureId}.json`));
          }
        });
      }

      // Store the endpoint for this test in the mock data object for this file if there are endpoints for this test
      if (endpoints.length > 0) {
        routesByTestId[this.currentTest.title] = endpoints;
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
          routesByTestId[testName].forEach((route) => {
            if (route.fixtureId) {
              cy.task('deleteFile', path.join(fixturesFolder, `${route.fixtureId}.json`));
            }
          });
        }
      });
    }

    removeFixture.forEach(fixtureName => cy.task('deleteFile', fixtureName));
    cy.writeFile(path.join(mocksFolder, `${fileName}.json`), isCleanMocks ? cleanMockData : routesByTestId);
    Object.keys(addFixture).forEach(fixtureName => {
      cy.writeFile(fixtureName, addFixture[fixtureName]);
    });
  });
};
