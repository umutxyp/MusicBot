const UTIL = require('./util.js');
const QS = require('querystring');
const PARSE_ITEM = require('./parseItem.js');
const MINIGET = require('miniget');
const PATH = require('path');
const FS = require('fs');

const BASE_PLIST_URL = 'https://www.youtube.com/playlist?';
const BASE_API_URL = 'https://www.youtube.com/youtubei/v1/browse?key=';

// eslint-disable-next-line complexity
const main = module.exports = async (linkOrId, options, rt = 3) => {
  // Set default values
  const plistId = await main.getPlaylistID(linkOrId);
  const opts = UTIL.checkArgs(plistId, options);

  const ref = BASE_PLIST_URL + QS.encode(opts.query);
  const body = await MINIGET(ref, opts.requestOptions).text();
  const parsed = UTIL.parseBody(body, opts);
  if (!parsed.json) {
    try {
      let browseId = UTIL.between(body, '"key":"browse_id","value":"', '"');
      if (!browseId) browseId = `VL${plistId}`;
      if (!parsed.apiKey || !parsed.context.client.clientVersion) throw new Error('Missing api key');
      parsed.json = await UTIL.doPost(BASE_API_URL + parsed.apiKey, opts, { context: parsed.context, browseId });
    } catch (e) {
      // Unknown
    }
  }

  // Youtube might just load the main page and set statuscode 204
  if (!parsed.json.sidebar) throw new Error('Unknown Playlist');

  // Retry if unable to find json => most likely old response
  if (!parsed.json) {
    if (rt === 0) {
      logger(body);
      throw new Error('Unsupported playlist');
    }
    return main(linkOrId, opts, rt - 1);
  }

  // Parse alerts
  if (parsed.json.alerts && !parsed.json.contents) {
    // Parse error
    let error = parsed.json.alerts.find(a => a.alertRenderer && a.alertRenderer.type === 'ERROR');
    if (error) throw new Error(UTIL.parseText(error.alertRenderer.text));
  }

  try {
    const info = parsed.json.sidebar
      .playlistSidebarRenderer.items
      .find(x => Object.keys(x)[0] === 'playlistSidebarPrimaryInfoRenderer')
      .playlistSidebarPrimaryInfoRenderer;

    const thumbnail = (
      info.thumbnailRenderer.playlistVideoThumbnailRenderer ||
      info.thumbnailRenderer.playlistCustomThumbnailRenderer
    ).thumbnail.thumbnails.sort((a, b) => b.width - a.width)[0];

    const resp = {
      id: plistId,
      thumbnail,
      url: `${BASE_PLIST_URL}list=${plistId}`,
      title: UTIL.parseText(info.title),
      total_items: UTIL.parseNumFromText(info.stats[0]),
      views: info.stats.length === 3 ? UTIL.parseNumFromText(info.stats[1]) : 0,
    };

    // Parse videos
    const itemSectionRenderer =
      parsed.json.contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.sectionListRenderer.contents.find(
        x => Object.keys(x)[0] === 'itemSectionRenderer',
      );
    if (!itemSectionRenderer) throw Error('Empty playlist');
    const playlistVideoListRenderer = itemSectionRenderer.itemSectionRenderer.contents.find(
      x => Object.keys(x)[0] === 'playlistVideoListRenderer',
    );
    if (!playlistVideoListRenderer) throw Error('Empty playlist');
    const rawVideoList = playlistVideoListRenderer.playlistVideoListRenderer.contents;
    resp.items = rawVideoList.map(PARSE_ITEM).filter(a => a).filter((_, index) => index < opts.limit);

    // Adjust tracker
    opts.limit -= resp.items.length;

    // Parse the continuation
    const continuation = rawVideoList.find(x => Object.keys(x)[0] === 'continuationItemRenderer');
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
    if (rt === 0) {
      logger(body);
      throw new Error(e);
    }
    return main(linkOrId, opts, rt - 1);
  }
};

const parsePage2 = async (apiKey, token, context, opts) => {
  const json = await UTIL.doPost(BASE_API_URL + apiKey, opts.requestOptions, { context, continuation: token });

  const wrapper = json.onResponseReceivedActions[0].appendContinuationItemsAction.continuationItems;

  // Parse items
  const parsedItems = wrapper.map(PARSE_ITEM).filter(a => a).filter((_, index) => index < opts.limit);

  // Adjust tracker
  opts.limit -= parsedItems.length;

  // Parse the continuation
  const continuation = wrapper.find(x => Object.keys(x)[0] === 'continuationItemRenderer');
  let nextToken = null;
  if (continuation) nextToken = continuation.continuationItemRenderer.continuationEndpoint.continuationCommand.token;

  // We're already on last page or hit the limit
  if (!nextToken || opts.limit < 1) return parsedItems;

  // Recursively fetch more items
  const nestedResp = await parsePage2(apiKey, nextToken, context, opts);
  parsedItems.push(...nestedResp);
  return parsedItems;
};

const YT_HOSTS = ['www.youtube.com', 'youtube.com', 'music.youtube.com'];
// Checks for a (syntactically) valid URL - mostly equals getPlaylistID
main.validateID = linkOrId => {
  // Validate inputs
  if (typeof linkOrId !== 'string' || !linkOrId) {
    return false;
  }
  // Clean id provided
  if (PLAYLIST_REGEX.test(linkOrId) || ALBUM_REGEX.test(linkOrId)) {
    return true;
  }
  if (CHANNEL_REGEX.test(linkOrId)) {
    return true;
  }
  // Playlist link provided
  const parsed = new URL(linkOrId, BASE_PLIST_URL);
  if (!YT_HOSTS.includes(parsed.host)) return false;
  if (parsed.searchParams.has('list')) {
    const listParam = parsed.searchParams.get('list');
    if (PLAYLIST_REGEX.test(listParam) || ALBUM_REGEX.test(listParam)) {
      return true;
    }
    // Mixes currently not supported
    // They would require fetching a video page & resolving the side-loaded playlist
    if (listParam && listParam.startsWith('RD')) {
      return false;
    }
    return false;
  }
  // Shortened channel or user page provided
  const p = parsed.pathname.substr(1).split('/');
  if (p.length < 2 || p.some(a => !a)) return false;
  const maybeType = p[p.length - 2];
  const maybeId = p[p.length - 1];
  if (maybeType === 'channel') {
    if (CHANNEL_REGEX.test(maybeId)) {
      return true;
    }
  } else if (maybeType === 'user') {
    // No request in here since we wanna keep it sync
    return true;
  } else if (maybeType === 'c') {
    // No request in here since we wanna keep it sync
    return true;
  }
  return false;
};

// Parse the input to a id (or error)
const PLAYLIST_REGEX = exports.PLAYLIST_REGEX = /^(FL|PL|UU|LL|RD)[a-zA-Z0-9-_]{16,41}$/;
const ALBUM_REGEX = exports.ALBUM_REGEX = /^OLAK5uy_[a-zA-Z0-9-_]{33}$/;
const CHANNEL_REGEX = exports.CHANNEL_REGEX = /^UC[a-zA-Z0-9-_]{22,32}$/;
main.getPlaylistID = async linkOrId => {
  // Validate inputs
  if (typeof linkOrId !== 'string' || !linkOrId) {
    throw new Error('The linkOrId has to be a string');
  }
  // Clean id provided
  if (PLAYLIST_REGEX.test(linkOrId) || ALBUM_REGEX.test(linkOrId)) {
    return linkOrId;
  }
  if (CHANNEL_REGEX.test(linkOrId)) {
    return `UU${linkOrId.substr(2)}`;
  }
  // Playlist link provided
  const parsed = new URL(linkOrId, BASE_PLIST_URL);
  if (!YT_HOSTS.includes(parsed.host)) throw new Error('not a known youtube link');
  if (parsed.searchParams.has('list')) {
    const listParam = parsed.searchParams.get('list');
    if (PLAYLIST_REGEX.test(listParam) || ALBUM_REGEX.test(listParam)) {
      return listParam;
    }
    // Mixes currently not supported
    // They would require fetching a video page & resolving the side-loaded playlist
    if (listParam && listParam.startsWith('RD')) {
      throw new Error('Mixes not supported');
    }
    // Default case
    throw new Error('invalid or unknown list query in url');
  }
  // Shortened channel or user page provided
  const p = parsed.pathname.substr(1).split('/');
  if (p.length < 2 || p.some(a => !a)) {
    throw new Error(`Unable to find a id in "${linkOrId}"`);
  }
  const maybeType = p[p.length - 2];
  const maybeId = p[p.length - 1];
  if (maybeType === 'channel') {
    if (CHANNEL_REGEX.test(maybeId)) {
      return `UU${maybeId.substr(2)}`;
    }
  } else if (maybeType === 'user') {
    // eslint-disable-next-line no-return-await
    return await toChannelList(`https://www.youtube.com/user/${maybeId}`);
  } else if (maybeType === 'c') {
    // eslint-disable-next-line no-return-await
    return await toChannelList(`https://www.youtube.com/c/${maybeId}`);
  }
  throw new Error(`Unable to find a id in "${linkOrId}"`);
};

// Gets the channel uploads id of a user (needed for uploads playlist)
const CHANNEL_ONPAGE_REGEXP = /channel_id=UC([\w-]{22,32})"/;
const toChannelList = async ref => {
  const body = await MINIGET(ref).text();
  const channelMatch = body.match(CHANNEL_ONPAGE_REGEXP);
  if (channelMatch) return `UU${channelMatch[1]}`;
  throw new Error(`unable to resolve the ref: ${ref}`);
};

const logger = content => {
  const dir = PATH.resolve(__dirname, '../dumps/');
  const file = PATH.resolve(dir, `${Math.random().toString(36).substr(3)}-${Date.now()}.txt`);
  const cfg = PATH.resolve(__dirname, '../package.json');
  const bugsRef = require(cfg).bugs.url;

  if (!FS.existsSync(dir)) FS.mkdirSync(dir);
  FS.writeFileSync(file, content);
  console.error(`\n/${'*'.repeat(200)}`);
  console.error('Unsupported YouTube Playlist response.');
  console.error(`Please post the the files in ${dir} to DisTube support server or ${bugsRef}. Thanks!`);
  console.error(`${'*'.repeat(200)}\\`);
  return null;
};
