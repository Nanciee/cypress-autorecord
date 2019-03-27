module.exports = (on, config, fs) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  const readFile = (filePath) => {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }

    return null;
  };

  const deleteFile = (filePath) => {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }

    return null;
  };

  const cleanMocks = () => {
    // TODO: create error handling
    const specFiles = fs.readdirSync('cypress/integration');
    const mockFiles = fs.readdirSync('cypress/mocks');
    mockFiles.forEach(mockName => {
      const isMockUsed = specFiles.find(specName => specName.split('.')[0] === mockName.split('.')[0]);
    if (!isMockUsed) {
      const mockData = readFile(`cypress/mocks/${mockName}`);
      Object.keys(mockData).forEach(testName => {
        mockData[testName].forEach((route) => {
          if (route.fixtureId) {
        deleteFile(`cypress/fixtures/${route.fixtureId}.json`);
      }
    });
    });

      deleteFile(`cypress/mocks/${mockName}`);
    }
  });

    return null;
  };

  const removeAllMocks = () => {
    const fixtureFiles = fs.readdirSync('cypress/fixtures');
    const mockFiles = fs.readdirSync('cypress/mocks');

    fixtureFiles.forEach(fileName => {
      deleteFile(`cypress/fixtures/${fileName}`);
  });

    mockFiles.forEach(fileName => {
      deleteFile(`cypress/mocks/${fileName}`);
  });

    return null;
  };

  on('task', {
    readFile,
    deleteFile,
    cleanMocks,
    removeAllMocks,
  });
};