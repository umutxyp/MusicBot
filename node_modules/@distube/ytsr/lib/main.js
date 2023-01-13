const PARSE_ITEM = require('./parseItem.js');
const MINIGET = require('miniget');
const UTIL = require('./util.js');
const QS = require('querystring');

const BASE_SEARCH_URL = 'https://www.youtube.com/results?';
const BASE_API_URL = 'https://www.youtube.com/youtubei/v1/search?key=';
const CACHE = new Map();

// Save api key and client version for safeSearch
const saveCache = (parsed, opts) => {
  if (parsed.apiKey) CACHE.set('apiKey', parsed.apiKey);
  else if (CACHE.has('apiKey')) parsed.apiKey = CACHE.get('apiKey');
  if (parsed.context) CACHE.set('clientVersion', parsed.context.client.clientVersion);
  else if (CACHE.has('clientVersion')) parsed.context = UTIL.buildPostContext(CACHE.get('clientVersion'), opts);
};

// eslint-disable-next-line complexity
const main = module.exports = async (searchString, options, rt = 3) => {
  if (rt === 2) {
    CACHE.delete('apiKey');
    CACHE.delete('clientVersion');
    CACHE.delete('playlistParams');
  }
  if (rt === 0) throw new Error('Unable to find JSON!');
  // Set default values
  const opts = UTIL.checkArgs(searchString, options);

  const ref = BASE_SEARCH_URL + QS.encode(opts.query);
  let parsed = {};
  if (!opts.safeSearch || !CACHE.has('apiKey') || !CACHE.has('clientVersion') || !CACHE.has('playlistParams')) {
    const body = await MINIGET(ref, opts.requestOptions).text();
    parsed = UTIL.parseBody(body, opts);
    let plParams = UTIL.betweenFromRight(body, `"params":"`, '"}},"tooltip":"Search for Playlist"');
    if (plParams) CACHE.set('playlistParams', plParams);
    saveCache(parsed, opts);
  }
  if (opts.type === 'playlist') {
    let params = 'EgIQAw%253D%253D';
    if (CACHE.has('playlistParams')) params = CACHE.get('playlistParams');
    parsed.json = await UTIL.doPost(BASE_API_URL + parsed.apiKey, opts, {
      context: parsed.context,
      params,
      query: searchString,
    }).catch(() => null);
    if (!parsed.json) throw new Error('Cannot searching for Playlist!');
  } else if (opts.safeSearch || !parsed.json) {
    try {
      if (!parsed.apiKey || !parsed.context.client.clientVersion) throw new Error('Missing api key');
      const context = parsed.context;
      parsed.json = await UTIL.doPost(BASE_API_URL + parsed.apiKey, opts, { context, query: searchString });
    } catch (e) {
      if (rt === 1) throw e;
    }
  }

  if (!parsed.json) return main(searchString, options, rt - 1);

  const resp = {
    query: opts.search,
  };

  try {
    // Parse items
    const { rawItems, continuation } = UTIL.parseWrapper(
      parsed.json.contents.twoColumnSearchResultsRenderer.primaryContents,
    );

    // Parse items
    resp.items = rawItems.map(a => PARSE_ITEM(a, resp))
      .filter(r => r && r.type === opts.type)
      .filter((_, index) => index < opts.limit);

    // Adjust tracker
    opts.limit -= resp.items.length;

    // Get amount of results
    resp.results = Number(parsed.json.estimatedResults) || 0;

    let token = null;
    if (continuation) token = continuation.continuationItemRenderer.continuationEndpoint.continuationCommand.token;

    // We're already on last page or hit the limit
    if (!token || opts.limit < 1) return resp;
    // Recursively fetch more items
    const nestedResp = await parsePage2(parsed.apiKey, token, parsed.context, opts);

    // Merge the responses
    resp.items.push(...nestedResp);
    return resp;
  } catch (e) {
    throw new Error('No result!');
  }
};

const parsePage2 = async (apiKey, token, context, opts) => {
  const json = await UTIL.doPost(BASE_API_URL + apiKey, opts.requestOptions, { context, continuation: token });
  if (!Array.isArray(json.onResponseReceivedCommands)) {
    // No more content
    return [];
  }

  const { rawItems, continuation } = UTIL.parsePage2Wrapper(
    json.onResponseReceivedCommands[0].appendContinuationItemsAction.continuationItems,
  );
  const parsedItems = rawItems.map(PARSE_ITEM)
    .filter(r => r && r.type === opts.type)
    .filter((_, index) => index < opts.limit);

  // Adjust tracker
  opts.limit -= parsedItems.length;

  let nextToken = null;
  if (continuation) nextToken = continuation.continuationItemRenderer.continuationEndpoint.continuationCommand.token;

  // We're already on last page or hit the limit
  if (!nextToken || opts.limit < 1) return parsedItems;

  // Recursively fetch more items
  const nestedResp = await parsePage2(apiKey, nextToken, context, opts);
  parsedItems.push(...nestedResp);
  return parsedItems;
};
