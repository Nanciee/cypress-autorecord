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

module.exports = {
  sizeInMbytes,
  guidGenerator
};
