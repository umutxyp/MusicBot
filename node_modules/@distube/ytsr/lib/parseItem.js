const UTIL = require('./util');
const BASE_VIDEO_URL = 'https://www.youtube.com/watch?v=';
const URL = require('url').URL;

module.exports = item => {
  const type = Object.keys(item)[0];
  try {
    switch (type) {
      case 'videoRenderer':
        return parseVideo(item[type]);
      case 'playlistRenderer':
        return parsePlaylist(item[type]);
      case 'gridVideoRenderer':
        return parseVideo(item[type]);
      default:
        return null;
    }
  } catch (e) {
    console.error(e);
    return null;
  }
};

const parseVideo = obj => {
  const author = obj.ownerText && obj.ownerText.runs[0];
  let authorUrl = null;
  if (author) {
    authorUrl = author.navigationEndpoint.browseEndpoint.canonicalBaseUrl ||
      author.navigationEndpoint.commandMetadata.webCommandMetadata.url;
  }
  const badges = Array.isArray(obj.badges) ? obj.badges.map(a => a.metadataBadgeRenderer.label) : [];
  const isLive = badges.some(b => ['LIVE NOW', 'LIVE'].includes(b));
  const upcoming = obj.upcomingEventData ? Number(`${obj.upcomingEventData.startTime}000`) : null;
  const ctsr = obj.channelThumbnailSupportedRenderers;
  const authorImg = !ctsr ? { thumbnail: { thumbnails: [] } } : ctsr.channelThumbnailWithLinkRenderer;
  const isOfficial = !!(obj.ownerBadges && JSON.stringify(obj.ownerBadges).includes('OFFICIAL'));
  const isVerified = !!(obj.ownerBadges && JSON.stringify(obj.ownerBadges).includes('VERIFIED'));
  const lengthFallback = obj.thumbnailOverlays.find(x => Object.keys(x)[0] === 'thumbnailOverlayTimeStatusRenderer');
  const length = obj.lengthText || (lengthFallback && lengthFallback.thumbnailOverlayTimeStatusRenderer.text);

  return {
    type: 'video',
    name: UTIL.parseText(obj.title),
    id: obj.videoId,
    url: BASE_VIDEO_URL + obj.videoId,
    thumbnail: UTIL.prepImg(obj.thumbnail.thumbnails)[0].url,
    thumbnails: UTIL.prepImg(obj.thumbnail.thumbnails),
    isUpcoming: !!upcoming,
    upcoming,
    isLive,
    badges,

    // Author can be null for shows like whBqghP5Oow
    author: author ? {
      name: author.text,
      channelID: author.navigationEndpoint.browseEndpoint.browseId,
      url: new URL(authorUrl, BASE_VIDEO_URL).toString(),
      bestAvatar: UTIL.prepImg(authorImg.thumbnail.thumbnails)[0] || null,
      avatars: UTIL.prepImg(authorImg.thumbnail.thumbnails),
      ownerBadges: Array.isArray(obj.ownerBadges) ? obj.ownerBadges.map(a => a.metadataBadgeRenderer.tooltip) : [],
      verified: isOfficial || isVerified,
    } : null,

    description: UTIL.parseText(obj.descriptionSnippet),

    views: !obj.viewCountText ? null : UTIL.parseIntegerFromText(obj.viewCountText),
    // Duration not provided for live & sometimes with upcoming & sometimes randomly
    duration: UTIL.parseText(length),
    // UploadedAt not provided for live & upcoming & sometimes randomly
    uploadedAt: UTIL.parseText(obj.publishedTimeText),
  };
};

const parsePlaylist = obj => ({
  type: 'playlist',
  id: obj.playlistId,
  name: UTIL.parseText(obj.title),
  url: `https://www.youtube.com/playlist?list=${obj.playlistId}`,

  // Some Playlists starting with OL only provide a simple string
  owner: obj.shortBylineText.simpleText ? null : _parseOwner(obj),

  publishedAt: UTIL.parseText(obj.publishedTimeText),
  length: Number(obj.videoCount),
});

const _parseOwner = obj => {
  const owner = (obj.shortBylineText && obj.shortBylineText.runs[0]) ||
    (obj.longBylineText && obj.longBylineText.runs[0]);
  const ownerUrl = owner.navigationEndpoint.browseEndpoint.canonicalBaseUrl ||
    owner.navigationEndpoint.commandMetadata.webCommandMetadata.url;
  const isOfficial = !!(obj.ownerBadges && JSON.stringify(obj.ownerBadges).includes('OFFICIAL'));
  const isVerified = !!(obj.ownerBadges && JSON.stringify(obj.ownerBadges).includes('VERIFIED'));
  const fallbackURL = owner.navigationEndpoint.commandMetadata.webCommandMetadata.url;

  return {
    name: owner.text,
    channelID: owner.navigationEndpoint.browseEndpoint.browseId,
    url: new URL(ownerUrl || fallbackURL, BASE_VIDEO_URL).toString(),
    ownerBadges: Array.isArray(obj.ownerBadges) ? obj.ownerBadges.map(a => a.metadataBadgeRenderer.tooltip) : [],
    verified: isOfficial || isVerified,
  };
};
