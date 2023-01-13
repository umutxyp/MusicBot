const querystring = require('querystring');
const Cache = require('./cache');
const utils = require('./utils');
const vm = require('vm');

// A shared cache to keep track of html5player js functions.
exports.cache = new Cache();

/**
 * Extract signature deciphering and n parameter transform functions from html5player file.
 *
 * @param {string} html5playerfile
 * @param {Object} options
 * @returns {Promise<Array.<string>>}
 */
exports.getFunctions = (html5playerfile, options) => exports.cache.getOrSet(html5playerfile, async() => {
  const body = await utils.exposedMiniget(html5playerfile, options).text();
  const functions = exports.extractFunctions(body);
  if (!functions || !functions.length) {
    throw Error('Could not extract functions');
  }
  exports.cache.set(html5playerfile, functions);
  return functions;
});

// eslint-disable-next-line max-len
// https://github.com/TeamNewPipe/NewPipeExtractor/blob/41c8dce452aad278420715c00810b1fed0109adf/extractor/src/main/java/org/schabi/newpipe/extractor/services/youtube/extractors/YoutubeStreamExtractor.java#L816
const REGEXES = [
  '(?:\\b|[^a-zA-Z0-9$])([a-zA-Z0-9$]{2,})\\s*=\\s*function\\(\\s*a\\s*\\)' +
  '\\s*\\{\\s*a\\s*=\\s*a\\.split\\(\\s*""\\s*\\)',
  '\\bm=([a-zA-Z0-9$]{2,})\\(decodeURIComponent\\(h\\.s\\)\\)',
  '\\bc&&\\(c=([a-zA-Z0-9$]{2,})\\(decodeURIComponent\\(c\\)\\)',
  '([\\w$]+)\\s*=\\s*function\\((\\w+)\\)\\{\\s*\\2=\\s*\\2\\.split\\(""\\)\\s*;',
  '\\b([\\w$]{2,})\\s*=\\s*function\\((\\w+)\\)\\{\\s*\\2=\\s*\\2\\.split\\(""\\)\\s*;',
  '\\bc\\s*&&\\s*d\\.set\\([^,]+\\s*,\\s*(:encodeURIComponent\\s*\\()([a-zA-Z0-9$]+)\\(',
];

const matchGroup1 = (regex, str) => {
  const match = str.match(new RegExp(regex));
  if (!match) throw new Error(`Could not match ${regex}`);
  return match[1];
};

const getDeobfuscationFuncName = body => {
  for (const regex of REGEXES) {
    try {
      return matchGroup1(regex, body);
    } catch (err) {
      continue;
    }
  }
  throw Error('Could not find deobfuscate function with any of the given patterns.');
};

/**
 * Extracts the actions that should be taken to decipher a signature
 * and tranform the n parameter
 *
 * @param {string} body
 * @returns {Array.<string>}
 */
exports.extractFunctions = body => {
  const functions = [];
  const extractDecipher = () => {
    try {
      // eslint-disable-next-line max-len
      // https://github.com/TeamNewPipe/NewPipeExtractor/blob/41c8dce452aad278420715c00810b1fed0109adf/extractor/src/main/java/org/schabi/newpipe/extractor/services/youtube/extractors/YoutubeStreamExtractor.java#L1139
      const deobfuscationFuncName = getDeobfuscationFuncName(body);
      const functionPattern = `(${deobfuscationFuncName.replaceAll('$', '\\$')}=function\\([a-zA-Z0-9_]+\\)\\{.+?\\})`;
      const deobfuscateFunction = `var ${matchGroup1(functionPattern, body)};`;
      const helperObjectName = matchGroup1(';([A-Za-z0-9_\\$]{2})\\...\\(', deobfuscateFunction).replaceAll('$', '\\$');
      const helperPattern = `(var ${helperObjectName.replaceAll('$', '\\$')}=\\{[\\s\\S]+?\\}\\};)`;
      const helperObject = matchGroup1(helperPattern, body);
      const callerFunction = `${deobfuscationFuncName}(sig);`;
      const decipherFunction = helperObject + deobfuscateFunction + callerFunction;
      functions.push(decipherFunction);
    } catch (err) {
      throw Error(`Could not parse deobfuscate function: ${err}`);
    }
  };
  const extractNCode = () => {
    let functionName = utils.between(body, `&&(b=a.get("n"))&&(b=`, `(b)`);
    if (functionName.includes('[')) functionName = utils.between(body, `${functionName.split('[')[0]}=[`, `]`);
    if (functionName && functionName.length) {
      const functionStart = `${functionName}=function(a)`;
      const ndx = body.indexOf(functionStart);
      if (ndx >= 0) {
        const end = body.indexOf('.join("")};', ndx);
        const subBody = body.slice(ndx, end);
        const functionBody = `${subBody}.join("")};${functionName}(ncode);`;
        functions.push(functionBody);
      }
    }
  };
  extractDecipher();
  extractNCode();
  return functions;
};

/**
 * Apply decipher and n-transform to individual format
 *
 * @param {Object} format
 * @param {vm.Script} decipherScript
 * @param {vm.Script} nTransformScript
 */
exports.setDownloadURL = (format, decipherScript, nTransformScript) => {
  const decipher = url => {
    const args = querystring.parse(url);
    if (!args.s || !decipherScript) return args.url;
    const components = new URL(decodeURIComponent(args.url));
    components.searchParams.set(args.sp ? args.sp : 'signature',
      decipherScript.runInNewContext({ sig: decodeURIComponent(args.s) }));
    return components.toString();
  };
  const ncode = url => {
    const components = new URL(decodeURIComponent(url));
    const n = components.searchParams.get('n');
    if (!n || !nTransformScript) return url;
    components.searchParams.set('n', nTransformScript.runInNewContext({ ncode: n }));
    return components.toString();
  };
  const cipher = !format.url;
  const url = format.url || format.signatureCipher || format.cipher;
  format.url = cipher ? ncode(decipher(url)) : ncode(url);
  delete format.signatureCipher;
  delete format.cipher;
};

/**
 * Applies decipher and n parameter transforms to all format URL's.
 *
 * @param {Array.<Object>} formats
 * @param {string} html5player
 * @param {Object} options
 */
exports.decipherFormats = async(formats, html5player, options) => {
  let decipheredFormats = {};
  let functions = await exports.getFunctions(html5player, options);
  const decipherScript = functions.length ? new vm.Script(functions[0]) : null;
  const nTransformScript = functions.length > 1 ? new vm.Script(functions[1]) : null;
  formats.forEach(format => {
    exports.setDownloadURL(format, decipherScript, nTransformScript);
    decipheredFormats[format.url] = format;
  });
  return decipheredFormats;
};
