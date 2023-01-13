const MINIGET = require('miniget');

const DEFAULT_OPTIONS = { limit: Infinity };
const DEFAULT_QUERY = { gl: 'US', hl: 'en' };
const DEFAULT_CONTEXT = {
  client: {
    utcOffsetMinutes: -300,
    gl: 'US',
    hl: 'en',
    clientName: 'WEB',
    clientVersion: '<important information>',
  },
  user: {},
  request: {},
};

exports.parseBody = (body, options = {}) => {
  let json = jsonAfter(body, 'window["ytInitialData"] = ') || jsonAfter(body, 'var ytInitialData = ') || null;

  const apiKey = between(body, 'INNERTUBE_API_KEY":"', '"') ||
    between(body, 'innertubeApiKey":"', '"');
  const clientVersion = between(body, 'INNERTUBE_CONTEXT_CLIENT_VERSION":"', '"') ||
    between(body, 'innertube_context_client_version":"', '"');
  // Make deep copy and set clientVersion
  const context = JSON.parse(JSON.stringify(DEFAULT_CONTEXT));
  context.client.clientVersion = clientVersion;
  // Copy params to context
  if (options.gl) context.client.gl = options.gl;
  if (options.hl) context.client.hl = options.hl;
  if (options.utcOffsetMinutes) context.client.utcOffsetMinutes = options.utcOffsetMinutes;
  // Return multiple values
  return { json, apiKey, context };
};

// Parsing utility
const parseText = exports.parseText = txt => txt.simpleText || txt.runs.map(a => a.text).join('');

exports.parseNumFromText = txt => Number(parseText(txt).replace(/\D+/g, ''));

// Request Utility
exports.doPost = async (url, opts, payload) => {
  if (!opts) opts = {};
  // Enforce POST-Request
  const reqOpts = Object.assign({}, opts, { method: 'POST' });
  const req = MINIGET(url, reqOpts);
  // Write request body
  if (payload) req.on('request', r => r.write(JSON.stringify(payload)));
  // Await response-text and parse json
  return JSON.parse(await req.text());
};

// Guarantee that all arguments are valid
exports.checkArgs = (plistId, options = {}) => {
  // Validation
  if (!plistId) {
    throw new Error('playlist ID is mandatory');
  }
  if (typeof plistId !== 'string') {
    throw new Error('playlist ID must be of type string');
  }


  // Normalisation
  let obj = Object.assign({}, DEFAULT_OPTIONS, options);
  // Other optional params
  if (isNaN(obj.limit) || obj.limit <= 0) obj.limit = DEFAULT_OPTIONS.limit;
  // Set required parameter: query
  obj.query = Object.assign({}, DEFAULT_QUERY, obj.query, { list: plistId });
  if (options && options.gl) obj.query.gl = options.gl;
  if (options && options.hl) obj.query.hl = options.hl;
  // Default requestOptions
  if (!options.requestOptions) options.requestOptions = {};
  // Unlink requestOptions
  obj.requestOptions = Object.assign({}, options.requestOptions);
  // Unlink requestOptions#headers
  if (obj.requestOptions.headers) {
    obj.requestOptions.headers = JSON.parse(JSON.stringify(obj.requestOptions.headers));
  }
  return obj;
};

/**
 * Extract json after given string.
 * loosely based on utils#between
 *
 * @param {string} haystack haystack
 * @param {string} left left
 * @returns {Object} the parsed json
 */
const jsonAfter = (haystack, left) => {
  try {
    let pos = haystack.indexOf(left);
    if (pos === -1) { return ''; }
    haystack = haystack.slice(pos + left.length);
    return JSON.parse(cutAfterJSON(haystack));
  } catch (e) {
    return null;
  }
};

/**
 * Extract string between another.
 * Property of https://github.com/fent/node-ytdl-core/blob/master/lib/utils.js
 *
 * @param {string} haystack haystack
 * @param {string} left left
 * @param {string} right right
 * @returns {string}
 */
const between = exports.between = (haystack, left, right) => {
  let pos;
  if (left instanceof RegExp) {
    const match = haystack.match(left);
    if (!match) { return ''; }
    pos = match.index + match[0].length;
  } else {
    pos = haystack.indexOf(left);
    if (pos === -1) { return ''; }
    pos += left.length;
  }
  haystack = haystack.slice(pos);
  pos = haystack.indexOf(right);
  if (pos === -1) { return ''; }
  haystack = haystack.slice(0, pos);
  return haystack;
};

/**
 * Match begin and end braces of input JSON, return only json
 * Property of https://github.com/fent/node-ytdl-core/blob/master/lib/utils.js
 *
 * @param {string} mixedJson mixedJson
 * @returns {string}
*/
const cutAfterJSON = mixedJson => {
  let open, close;
  if (mixedJson[0] === '[') {
    open = '[';
    close = ']';
  } else if (mixedJson[0] === '{') {
    open = '{';
    close = '}';
  }

  if (!open) {
    throw new Error(`Can't cut unsupported JSON (need to begin with [ or { ) but got: ${mixedJson[0]}`);
  }

  // States if the loop is currently in a string
  let isString = false;

  // Current open brackets to be closed
  let counter = 0;

  let i;
  for (i = 0; i < mixedJson.length; i++) {
    // Toggle the isString boolean when leaving/entering string
    if (mixedJson[i] === '"' && mixedJson[i - 1] !== '\\') {
      isString = !isString;
      continue;
    }
    if (isString) continue;

    if (mixedJson[i] === open) {
      counter++;
    } else if (mixedJson[i] === close) {
      counter--;
    }

    // All brackets have been closed, thus end of JSON is reached
    if (counter === 0) {
      // Return the cut JSON
      return mixedJson.substr(0, i + 1);
    }
  }

  // We ran through the whole string and ended up with an unclosed bracket
  throw Error("Can't cut unsupported JSON (no matching closing bracket found)");
};
