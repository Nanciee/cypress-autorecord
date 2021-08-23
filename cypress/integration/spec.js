const autoRecord = require('../../index');
const testName = 'records a mock after the test has finished';

// Ensures the next test doesn't load fixtures before they're
// deleted!
describe('beforeSetup', function () {
  beforeEach(function () {
    cy.task('removeAllMocks');
  });

  it('deletes the mocks', function () {
    cy.readFile('../mocks/spec.json').should('not.exist');
  });
});

describe('setup', function () {
  autoRecord();

  beforeEach(function () {
    cy.visit('cypress/integration/index.html');
  });

  it(testName, function () {
    cy.readFile('../mocks/spec.json').should('not.exist');
    // Ensure the http request has finished
    cy.contains(/"id":1/i);
  });
});

describe('test', function () {
  context('the generated mock file', function () {
    it('should contain the json response', function () {
      cy.readFile('cypress/mocks/spec.json').then((mock) => {
        cy.wrap(mock).its(testName).should('exist');

        const { routes } = mock[testName];
        const [{ response }] = routes;

        expect(response.data).to.include({ id: 1 });
      });
    });
  });
});
