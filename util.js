// const fs = require('fs');
//
// const readFile = (filePath) => {
//   if (fs.existsSync(filePath)) {
//     return JSON.parse(fs.readFileSync(filePath, 'utf8'));
//   }
//
//   return null;
// };
//
// const deleteFile = (filePath) => {
//   if (fs.existsSync(filePath)) {
//     fs.unlinkSync(filePath);
//     return true;
//   }
//
//   return null;
// };
//
// const cleanMocks = () => {
//   // TODO: create error handling
//   const specFiles = fs.readdirSync('cypress/integration');
//   const mockFiles = fs.readdirSync('cypress/mocks');
//   mockFiles.forEach(mockName => {
//     const isMockUsed = specFiles.find(specName => specName.split('.')[0] === mockName.split('.')[0]);
//     if (!isMockUsed) {
//       const mockData = readFile(`cypress/mocks/${mockName}`);
//       Object.keys(mockData).forEach(testName => {
//         mockData[testName].forEach((route) => {
//           if (route.fixtureId) {
//             deleteFile(`cypress/fixtures/${route.fixtureId}.json`);
//           }
//         });
//       });
//
//       deleteFile(`cypress/mocks/${mockName}`);
//     }
//   });
//
//   return null;
// };
//
// const removeAllMocks = () => {
//   const fixtureFiles = fs.readdirSync('cypress/fixtures');
//   const mockFiles = fs.readdirSync('cypress/mocks');
//
//   fixtureFiles.forEach(fileName => {
//     deleteFile(`cypress/fixtures/${fileName}`);
//   });
//
//   mockFiles.forEach(fileName => {
//     deleteFile(`cypress/mocks/${fileName}`);
//   });
//
//   return null;
// };

const sizeInMbytes = (obj) => {
  let bytes = 0;

  const sizeOf = (obj) => {
    if (obj !== null && obj !== undefined) {
      switch (typeof obj) {
        case 'number':
          bytes += 8;
          break;
        case 'string':
          bytes += obj.length * 2;
          break;
        case 'boolean':
          bytes += 4;
          break;
        case 'object':
          var objClass = Object.prototype.toString.call(obj).slice(8, -1);
          if (objClass === 'Object' || objClass === 'Array') {
            for (var key in obj) {
              if (!obj.hasOwnProperty(key)) continue;
              sizeOf(obj[key]);
            }
          } else bytes += obj.toString().length * 2;
          break;
      }
    }
    return bytes;
  };

  return sizeOf(obj) / 1024;
};

const guidGenerator = () => {
  const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  return (S4() + S4() + S4() + S4() + S4() + S4() + S4() + S4());
};

module.exports = {
  sizeInMbytes,
  guidGenerator,
  // readFile,
  // deleteFile,
  // cleanMocks,
  // removeAllMocks,
};