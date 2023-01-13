exports.require = function loader(list) {
  const errorLog = [];
  for (const [name, fn] of list) {
    try {
      const data = fn(require(name));
      data.name = name;
      return data;
    } catch (e) {
      errorLog.push(e);
    }
  }
  throw new Error(errorLog.join('\n'));
};
