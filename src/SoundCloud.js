const youtubedl = require('youtube-dl-exec');
const axios = require('axios');
const config = require('../config');
const LanguageManager = require('./LanguageManager');

class SoundCloud {
    // SoundCloud no longer requires client ID, we'll use yt-dlp directly

    static async search(query, limit = 1, guildId = null) {
        try {


            // If it's already a SoundCloud URL, get info directly
            if (this.isSoundCloudURL(query)) {
                const info = await this.getInfo(query, guildId);
                return info ? [info] : [];
            }

            // We'll use yt-dlp for SoundCloud search
            // SoundCloud search: "ytsearch5:query site:soundcloud.com"
            const searchQuery = `ytsearch${limit}:${query} site:soundcloud.com`;

            const results = await youtubedl(searchQuery, {
                dumpSingleJson: true,
                flatPlaylist: true,
                noCheckCertificates: true,
                noWarnings: true,
            });

            if (!results || !results.entries) {

                return [];
            }

            const tracks = [];
            for (const item of results.entries.slice(0, limit)) {
                try {
                    // Filter only SoundCloud links
                    if (item.webpage_url && item.webpage_url.includes('soundcloud.com')) {
                        const track = await this.formatTrack(item, guildId);
                        if (track) {
                            tracks.push(track);
                        }
                    }
                } catch (error) {
                    continue;
                }
            }


            return tracks;

        } catch (error) {
            return [];
        }
    }

    static async getInfo(url, guildId = null) {
        try {


            // Get SoundCloud info using yt-dlp
            const info = await youtubedl(url, {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
            });

            if (!info) {
                const errorMsg = guildId ? await LanguageManager.getTranslation(guildId, 'soundcloud.no_info_returned') : 'No info returned from SoundCloud';
                throw new Error(errorMsg);
            }

            const track = await this.formatTrack(info, guildId);

            return track;

        } catch (error) {
            return null;
        }
    }

    static async getStream(url, guildId = null, startSeconds = 0) {
        try {


            // Get audio stream using yt-dlp
            const result = await youtubedl(url, {
                format: 'bestaudio/best',
                getUrl: true,
                noCheckCertificates: true,
                noWarnings: true,
            });

            if (!result) {
                const errorMsg = guildId ? await LanguageManager.getTranslation(guildId, 'soundcloud.no_stream_url') : 'No stream URL found';
                throw new Error(errorMsg);
            }

            // Note: SoundCloud streams typically don't support seek via URL parameters
            // Seeking will be handled by FFmpeg in MusicPlayer
            return result;

        } catch (error) {
            throw error;
        }
    }

    static async getPlaylist(url, guildId = null) {
        try {


            // Get playlist info using yt-dlp
            const result = await youtubedl(url, {
                dumpSingleJson: true,
                flatPlaylist: true,
                noCheckCertificates: true,
                noWarnings: true,
            });

            if (!result || !result.entries) {
                const errorMsg = guildId ? await LanguageManager.getTranslation(guildId, 'soundcloud.no_playlist_tracks') : 'No playlist tracks found';
                throw new Error(errorMsg);
            }

            const tracks = [];
            for (const item of result.entries.slice(0, config.bot.maxPlaylistSize)) {
                const formattedTrack = await this.formatTrack(item, guildId);
                if (formattedTrack) {
                    tracks.push(formattedTrack);
                }
            }

            const unknownPlaylist = guildId ? await LanguageManager.getTranslation(guildId, 'soundcloud.unknown_playlist') : 'Unknown Playlist';

            return {
                title: result.title || result.playlist_title || unknownPlaylist,
                tracks: tracks,
                totalTracks: result.playlist_count || tracks.length,
                url: url,
                platform: 'soundcloud',
                type: 'playlist',
                description: result.description,
                user: result.uploader || result.playlist_uploader,
            };

        } catch (error) {
            return null;
        }
    }

    static async getUserTracks(userUrl, limit = 10, guildId = null) {
        try {

            // Use yt-dlp for SoundCloud user profile
            // Get user's latest tracks
            const result = await youtubedl(userUrl, {
                dumpSingleJson: true,
                flatPlaylist: true,
                playlistEnd: limit,
                noCheckCertificates: true,
                noWarnings: true,
            });

            if (!result || !result.entries) {
                return [];
            }

            const tracks = [];
            for (const item of result.entries.slice(0, limit)) {
                const formattedTrack = await this.formatTrack(item, guildId);
                if (formattedTrack) {
                    tracks.push(formattedTrack);
                }
            }


            return tracks;

        } catch (error) {
            return [];
        }
    }

    static async formatTrack(soundcloudTrack, guildId = null) {
        try {
            const unknownTitle = guildId ? await LanguageManager.getTranslation(guildId, 'soundcloud.unknown_title') : 'Unknown Title';
            const unknownArtist = guildId ? await LanguageManager.getTranslation(guildId, 'soundcloud.unknown_artist') : 'Unknown Artist';

            const track = {
                title: soundcloudTrack.title || soundcloudTrack.fulltitle || unknownTitle,
                artist: soundcloudTrack.uploader || soundcloudTrack.artist || unknownArtist,
                url: soundcloudTrack.webpage_url || soundcloudTrack.url,
                duration: soundcloudTrack.duration || 0,
                thumbnail: soundcloudTrack.thumbnail,
                platform: 'soundcloud',
                type: 'track',
                id: soundcloudTrack.id,
                description: soundcloudTrack.description,
                uploadDate: soundcloudTrack.upload_date,
                viewCount: soundcloudTrack.view_count,
                likeCount: soundcloudTrack.like_count,
                channel: soundcloudTrack.channel,
                channelId: soundcloudTrack.channel_id,
            };

            return track;
        } catch (error) {
            return null;
        }
    }

    static isSoundCloudURL(url) {
        const patterns = [
            /^https?:\/\/(www\.)?soundcloud\.com\/[\w-]+\/[\w-]+/,
            /^https?:\/\/(www\.)?soundcloud\.com\/[\w-]+\/sets\/[\w-]+/,
            /^https?:\/\/(www\.)?soundcloud\.com\/[\w-]+$/,
        ];
        return patterns.some(pattern => pattern.test(url));
    }

    static isPlaylist(url) {
        return url.includes('/sets/');
    }

    static isTrack(url) {
        return this.isSoundCloudURL(url) && !this.isPlaylist(url) && !this.isUser(url);
    }

    static isUser(url) {
        // Check if it's a user profile URL (no track or playlist path)
        const match = url.match(/^https?:\/\/(www\.)?soundcloud\.com\/([\w-]+)$/);
        return !!match;
    }

    static extractUsername(url) {
        const match = url.match(/^https?:\/\/(www\.)?soundcloud\.com\/([\w-]+)/);
        return match ? match[2] : null;
    }

    static extractTrackSlug(url) {
        const match = url.match(/^https?:\/\/(www\.)?soundcloud\.com\/[\w-]+\/([\w-]+)/);
        return match ? match[2] : null;
    }

    static extractPlaylistSlug(url) {
        const match = url.match(/^https?:\/\/(www\.)?soundcloud\.com\/[\w-]+\/sets\/([\w-]+)/);
        return match ? match[2] : null;
    }

    static async validateUrl(url) {
        try {
            if (!this.isSoundCloudURL(url)) {
                return false;
            }

            // URL validation with yt-dlp
            const info = await youtubedl(url, {
                dumpSingleJson: true,
                noCheckCertificates: true,
                noWarnings: true,
            });
            return !!info && !!info.title;

        } catch (error) {
            return false;
        }
    }

    static formatDuration(milliseconds) {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }

    static createTrackUrl(username, trackSlug) {
        return `https://soundcloud.com/${username}/${trackSlug}`;
    }

    static createPlaylistUrl(username, playlistSlug) {
        return `https://soundcloud.com/${username}/sets/${playlistSlug}`;
    }

    static createUserUrl(username) {
        return `https://soundcloud.com/${username}`;
    }

    static async getRelatedTracks(trackUrl, limit = 5) {
        try {

            // This would implement getting related tracks
            // For now, return empty array as it requires complex implementation
            return [];

        } catch (error) {
            return [];
        }
    }

    static async searchAdvanced(query, options = {}, guildId = null) {
        try {
            // Advanced search using yt-dlp (simplified)
            return await this.search(query, options.limit || 20, guildId);

            const {
                limit = 20,
                offset = 0,
                filter = 'all', // 'all', 'tracks', 'playlists', 'users'
                sort = 'relevance' // 'relevance', 'created_at', 'hotness', 'duration'
            } = options;

            const searchUrl = `https://api-v2.soundcloud.com/search`;
            const params = {
                q: query,
                client_id: this.clientId,
                limit: limit,
                offset: offset,
                filter: filter,
                sort: sort,
            };

            const response = await axios.get(searchUrl, { params });

            if (!response.data || !response.data.collection) {
                return [];
            }

            const tracks = [];
            for (const item of response.data.collection) {
                if (item.kind === 'track') {
                    const track = await this.formatTrack(item);
                    if (track) {
                        tracks.push(track);
                    }
                }
            }

            return tracks;

        } catch (error) {
            return [];
        }
    }
}

module.exports = SoundCloud;