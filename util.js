const sizeInMbytes = (obj) => {
  let bytes = 0;

  const sizeOf = (obj) => {
    let objClass;
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
          objClass = Object.prototype.toString.call(obj).slice(8, -1);
          if (objClass === 'Object' || objClass === 'Array') {
            for (const key in obj) {
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
  const s4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  return (s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4());
};

const blobToPlain = (blob) => {
  let uri = URL.createObjectURL(blob);
  let xhr = new XMLHttpRequest();

  xhr.open('GET', uri, false);
  xhr.send();

  URL.revokeObjectURL(uri);

  return blob.type === 'application/json'
    ? JSON.parse(xhr.response)
    : xhr.response;
}

const replaceUrlsWithServiceEnvVars = (url, envVarsConfig) => {
  envVarsConfig.forEach(envVar => {
    url = url.replace(Cypress.env(envVar), `{${envVar}}`);
  });
  return url;
};

const replaceServiceEnvVarsWithUrls = (url, envVarsConfig) => {
  envVarsConfig.forEach(envVar => {
    url = url.replace(`{${envVar}}`, Cypress.env(envVar));
  });
  return url;
};

module.exports = {
  sizeInMbytes,
  guidGenerator,
  blobToPlain,
  replaceUrlsWithServiceEnvVars,
  replaceServiceEnvVarsWithUrls
};
