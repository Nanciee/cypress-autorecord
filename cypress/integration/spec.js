const autoRecord = require('../../index');
const testName = 'records a mock after the test has finished';

describe('setup', function () {
  autoRecord();

  beforeEach(function () {
    cy.task('removeAllMocks');
    cy.visit('cypress/integration/index.html');
  });

  it(testName, function () {
    cy.readFile('../mocks/spec.json').should('not.exist');
    // Ensure the http request has finished
    cy.contains(/"userId":1/i);
  });
});

describe('test', function () {
  context('the generated mock file', function () {
    it('should contain the json response', function () {
      cy.readFile('cypress/mocks/spec.json').then((mock) => {
        cy.wrap(mock).its(testName).should('exist');

        const { routes } = mock[testName];
        const [{ response }] = routes;

        expect(response).to.include({ userId: 1, id: 1 });
      });
    });
  });
});
