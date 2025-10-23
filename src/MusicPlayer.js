const {
    AudioPlayerStatus,
    createAudioPlayer,
    createAudioResource,
    VoiceConnectionStatus,
    joinVoiceChannel,
    entersState,
    StreamType
} = require('@discordjs/voice');
const { EmbedBuilder } = require('discord.js');
const config = require('../config');
const YouTube = require('./YouTube');
const Spotify = require('./Spotify');
const SoundCloud = require('./SoundCloud');
const DirectLink = require('./DirectLink');
const LanguageManager = require('./LanguageManager');
const PlayerStateManager = require('./PlayerStateManager');
const LyricsManager = require('./LyricsManager');
const prism = require('prism-media');
const ffmpegPath = require('ffmpeg-static');
const { promisify } = require('util');
const chalk = require('chalk');
const { pipeline, Readable } = require('stream');
const pipelineAsync = promisify(pipeline);
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const crypto = require('crypto');

// Cache directory for downloaded audio files
const CACHE_DIR = path.join(__dirname, '..', 'audio_cache');

// Ensure cache directory exists
if (!fsSync.existsSync(CACHE_DIR)) {
    fsSync.mkdirSync(CACHE_DIR, { recursive: true });
}

let cachedFetch;
async function ensureFetch() {
    if (cachedFetch) return cachedFetch;
    if (typeof global.fetch === 'function') {
        cachedFetch = global.fetch.bind(global);
    } else {
        const mod = await import('node-fetch');
        cachedFetch = mod.default;
    }
    return cachedFetch;
}

class MusicPlayer {
    constructor(guild, textChannel, voiceChannel) {
        this.guild = guild;
        this.textChannel = textChannel;
        this.voiceChannel = voiceChannel;

        // Audio player setup
        this.audioPlayer = createAudioPlayer();
        this.connection = null;
        this.resource = null;

        // Queue management
        this.queue = [];
        this.currentTrack = null;
        this.previousTracks = [];

        // Player settings
        this.volume = config.bot.defaultVolume;
        this.loop = false; // false, 'track', 'queue'
        this.shuffle = false;
        this.autoplay = false; // false or genre string: 'pop', 'rock', 'hiphop', etc.
        this.paused = false;

        // Timestamps
        this.startTime = null;
        this.pausedTime = 0;

        // Filters
        this.currentFilter = null;

        // UI Management
        this.nowPlayingMessage = null;
        this.requesterId = null;

        // Session management - unique ID to prevent old button interactions
        this.sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);

        // Preloading system - preload all queued tracks immediately
        this.preloadedStreams = new Map(); // trackUrl -> streamInfo
        this.preloadingQueue = []; // URLs being preloaded

        // Voice connection recovery system
        this.isRecovering = false;
        this.maxRecoveryAttempts = 5;
        this.recoveryAttempts = 0;
        this.recoveryInterval = null;
        this.connectionHealthCheck = null;

        // Playback lifecycle state
        this.trackTimer = null;
        this.isTransitioning = false;
        this.pendingEndReason = null;
        this.currentTrackRetries = 0;
        this.skipRequested = false;
        this.stopRequested = false;
        this.expectedTrackEndTs = null;
        this.currentTrackCache = null;
        this.activeStreamInfo = null;
        this.lastPlaybackPosition = 0;
        this.currentTrackStartOffsetMs = 0;

        // Lyrics system (button-only, no sync)
        this.currentLyrics = null; // Lyrics data for current track

        // Persistence management
        this.stateSyncInterval = null;
        this.stateSyncIntervalMs = 5000;
        this.stateSaveTimeout = null;

        // Pause management
        this.pauseReasons = new Set();

        // Inactivity timeout
        this.inactivityTimer = null;
        this.inactivityTimeoutMs = 2 * 60 * 1000;

        // Local file caching
        this.currentDownloadedFile = null; // Path to currently playing downloaded file
        this.downloadedFiles = new Set(); // Track all downloaded files for cleanup
        this.downloadingFiles = new Set(); // Track files currently being downloaded to prevent duplicates

        // Events setup
        this.setupEvents();
    }

    setupEvents() {
        // Audio player events
        this.audioPlayer.on(AudioPlayerStatus.Playing, () => {
            // When resuming, adjust startTime to account for elapsed offset
            if (this.paused && this.pausedTime > 0) {
                // Resuming from pause - keep the accumulated pausedTime
                this.startTime = Date.now();
            } else if (!this.startTime) {
                // First time playing - set start time accounting for any offset
                this.startTime = Date.now();
            }
            this.paused = false;
        });

        this.audioPlayer.on(AudioPlayerStatus.Paused, () => {
            if (this.startTime) {
                this.pausedTime += Date.now() - this.startTime;
            }
            this.paused = true;
        });

        this.audioPlayer.on(AudioPlayerStatus.Idle, () => {
            this.onPlayerIdle('idle');
        });

        this.audioPlayer.on('error', (error) => {
            console.error('🎵 Audio player error:', error);

            // If it's a stream error and we have a current track, try to recovery
            if (this.currentTrack && error.message &&
                (error.message.includes('stream') || error.message.includes('network'))) {
                this.startConnectionRecovery();
            } else {
                this.handleError(error);
            }
        });

        // Start connection health monitoring
        this.startConnectionHealthCheck();

        // Voice connection events will be set up in setupConnectionEvents()
        this.setupConnectionEvents();
    }

    setupConnectionEvents() {
        if (!this.connection) return;

        this.connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {

            // Don't trigger recovery if we're already recovering or if user disconnected bot
            if (this.isRecovering || newState.reason === 'Manual disconnect') {
                return;
            }

            // Try to auto-reconnect immediately for network disconnections
            try {
                await entersState(this.connection, VoiceConnectionStatus.Connecting, 5000);
                // If we get here, Discord is trying to reconnect automatically
                await entersState(this.connection, VoiceConnectionStatus.Ready, 10000);

            } catch (error) {
                // Auto-reconnect failed, start our recovery system if music is playing
                if (this.currentTrack && !this.paused) {
                    this.startConnectionRecovery();
                }
            }
        });

        this.connection.on(VoiceConnectionStatus.Destroyed, () => {
            // Only start recovery if we have music playing and we're not already recovering
            if (this.currentTrack && !this.paused && !this.isRecovering) {
                this.startConnectionRecovery();
            }
        });

        this.connection.on('error', (error) => {
            console.error('🚨 Voice connection error:', error);
            if (this.currentTrack && !this.paused) {
                this.startConnectionRecovery();
            }
        });

        // Monitor connection status changes
        this.connection.on('stateChange', (oldState, newState) => {
            if (newState.status === VoiceConnectionStatus.Ready) {
                // Connection recovered successfully
                if (this.isRecovering) {
                    this.stopConnectionRecovery();
                }
                this.recoveryAttempts = 0;
            }
        });
    }

    startConnectionHealthCheck() {
        // Check connection health every 30 seconds
        this.connectionHealthCheck = setInterval(async () => {
            try {
                // Check connection health
                if (!this.connection || this.connection.state.status === VoiceConnectionStatus.Destroyed) {
                    if (this.currentTrack && !this.paused && !this.isRecovering) {
                        this.startConnectionRecovery();
                    }
                }

                // Check if voice channel still exists
                const channel = this.guild.channels.cache.get(this.voiceChannel.id);
                if (!channel) {
                    this.cleanup();
                    return;
                }
            } catch (error) {
                console.error('❌ Health check error:', error);
            }
        }, 30000);
    }

    async startConnectionRecovery() {
        if (this.isRecovering) return;

        this.isRecovering = true;
        this.recoveryAttempts = 0;

        // Save current playback position
        this.savePlaybackPosition();

        // Start recovery attempts
        this.recoveryInterval = setInterval(async () => {
            this.recoveryAttempts++;
            if (this.recoveryAttempts > this.maxRecoveryAttempts) {
                this.stopConnectionRecovery();
                return;
            }

            try {
                // Check if voice channel still exists and bot is still in it
                const channel = this.guild.channels.cache.get(this.voiceChannel.id);
                if (!channel) {
                    this.stopConnectionRecovery();
                    return;
                }

                // Try to reconnect
                const reconnected = await this.forceReconnect();

                if (reconnected) {
                    // Resume playback from where we left off
                    await this.resumePlaybackAfterRecovery();
                    this.stopConnectionRecovery();
                }
            } catch (error) {
                console.error(`❌ Recovery attempt ${this.recoveryAttempts} failed:`, error);
            }
        }, 3000); // Try every 3 seconds
    }

    stopConnectionRecovery() {
        if (this.recoveryInterval) {
            clearInterval(this.recoveryInterval);
            this.recoveryInterval = null;
        }
        this.isRecovering = false;
        this.recoveryAttempts = 0;
    }

    savePlaybackPosition() {
        if (this.startTime && !this.paused) {
            const elapsedMs = (Date.now() - this.startTime) + this.pausedTime;
            const totalMs = this.currentTrackStartOffsetMs + elapsedMs;
            this.lastPlaybackPosition = totalMs;
        }
    }

    async forceReconnect() {
        try {
            // Destroy old connection
            if (this.connection) {
                this.connection.destroy();
            }

            // Create new connection
            this.connection = joinVoiceChannel({
                channelId: this.voiceChannel.id,
                guildId: this.guild.id,
                adapterCreator: this.guild.voiceAdapterCreator,
            });

            // Set up events for new connection
            this.setupConnectionEvents();

            // Subscribe audio player
            this.connection.subscribe(this.audioPlayer);

            // Wait for connection to be ready
            await entersState(this.connection, VoiceConnectionStatus.Ready, 15000);
            return true;
        } catch (error) {
            console.error('❌ Force reconnect failed:', error);
            return false;
        }
    }

    async resumePlaybackAfterRecovery() {
        if (!this.currentTrack) return;

        try {
            const resumeMs = this.resource
                ? this.currentTrackStartOffsetMs + (this.resource.playbackDuration || 0)
                : this.lastPlaybackPosition || 0;
            await this.play(null, resumeMs);

        } catch (error) {
            console.error('❌ Failed to resume playback:', error);
            // Try to continue with next track
            await this.handleTrackEnd('error');
        }
    }

    async connect() {
        try {
            // Wait for guild's WebSocket to be ready (critical for sharding)
            if (!this.guild.voiceAdapterCreator) {
                // Wait up to 10 seconds for the adapter to become available
                const maxWait = 10000;
                const startTime = Date.now();
                
                while (!this.guild.voiceAdapterCreator && (Date.now() - startTime) < maxWait) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    // Try to fetch the guild again to refresh its state
                    if (this.guild.client) {
                        try {
                            const freshGuild = await this.guild.client.guilds.fetch(this.guild.id);
                            if (freshGuild && freshGuild.voiceAdapterCreator) {
                                // Update our guild reference
                                Object.assign(this.guild, freshGuild);
                                break;
                            }
                        } catch (e) {
                            // Ignore fetch errors
                        }
                    }
                }
                
                if (!this.guild.voiceAdapterCreator) {
                    throw new Error('Guild voice adapter not ready after waiting');
                }
            }

            this.connection = joinVoiceChannel({
                channelId: this.voiceChannel.id,
                guildId: this.guild.id,
                adapterCreator: this.guild.voiceAdapterCreator,
            });

            // Set up connection events
            this.setupConnectionEvents();

            this.connection.subscribe(this.audioPlayer);

            // Wait for connection to be ready
            await entersState(this.connection, VoiceConnectionStatus.Ready, 30000);
            return true;
        } catch (error) {
            console.error('❌ Failed to connect to voice channel:', error.message);
            throw error; // Re-throw so restoreFromState can handle it
        }
    }

    async moveToChannel(newChannel) {
        if (!newChannel) return false;

        this.voiceChannel = newChannel;

        if (this.connection) {
            try {
                this.connection.rejoin({
                    channelId: newChannel.id,
                    selfDeaf: false,
                    selfMute: false
                });

                await entersState(this.connection, VoiceConnectionStatus.Ready, 15000);
                return true;
            } catch (error) {
                console.error('❌ Failed to rejoin new voice channel:', error);
                try {
                    this.connection.destroy();
                } catch (destroyError) {
                    console.error('❌ Error destroying old connection:', destroyError);
                }
                this.connection = null;
            }
        }

        return await this.connect();
    }

    disconnect() {
        if (this.connection && this.connection.state && this.connection.state.status !== 'destroyed') {
            try {
                this.connection.destroy();
            } catch (error) {
            }
        }
        this.connection = null;
    }

    async addTrack(query, requestedBy, platform = 'auto') {
        try {
            let tracks = [];

            // Determine platform and get track info
            if (platform === 'auto') {
                platform = this.detectPlatform(query);
            }

            switch (platform) {
                case 'youtube':
                    tracks = await YouTube.search(query, 1, this.guild.id);
                    break;
                case 'spotify':
                    // Check if it's a Spotify URL for consistency
                    if (Spotify.isSpotifyURL(query)) {
                        tracks = await Spotify.getFromURL(query, this.guild.id);
                    } else {
                        tracks = await Spotify.search(query, 1, 'track', this.guild.id);
                    }
                    break;
                case 'soundcloud':
                    tracks = await SoundCloud.search(query, 1, this.guild.id);
                    break;
                case 'direct':
                    tracks = await DirectLink.getInfo(query);
                    break;
                default:
                    // Default to YouTube search
                    tracks = await YouTube.search(query, 1, this.guild.id);
            }

            if (!tracks || tracks.length === 0) {
                const errorMsg = await LanguageManager.getTranslation(this.guild.id, 'musicplayer.no_results_found');
                return { success: false, message: errorMsg };
            }

            // Add tracks to queue
            const addedTracks = [];
            const wasIdle = !this.currentTrack; // Remember state BEFORE modification

            for (const track of tracks.slice(0, config.bot.maxPlaylistSize)) {
                track.requestedBy = requestedBy;
                track.addedAt = Date.now();

                if (this.currentTrack) {
                    this.queue.push(track);
                } else {
                    this.currentTrack = track;
                }
                addedTracks.push(track);
            }

            // Immediately preload ALL newly added tracks (before playing)
            for (const track of addedTracks) {
                // Skip the first track ONLY if player was idle and this track will start playing immediately
                const isAboutToPlay = wasIdle && track === addedTracks[0];
                if (!isAboutToPlay && !this.preloadedStreams.has(track.url)) {
                    this.preloadTrack(track).catch(err => {
                        if (err && err.message) {
                            console.error(`❌ Preload error for ${track.title}:`, err.message);
                        }
                    });
                }
            }

            // Auto-play if not currently playing
            if (wasIdle) {
                // Player was idle, start playing the first added track from beginning
                if (addedTracks.length > 0) {
                    this.currentTrack = addedTracks[0];
                    await this.play(null, 0);
                }
            } else if (this.audioPlayer.state && this.audioPlayer.state.status === AudioPlayerStatus.Idle) {
                // Player exists but is idle (finished playing) - start next from queue
                await this.play(null, 0);
            }

            const result = {
                success: true,
                tracks: addedTracks,
                isPlaylist: tracks.length > 1,
                position: this.queue.length
            };

            await this.persistState('queue-update');
            return result;

        } catch (error) {
            const errorMsg = await LanguageManager.getTranslation(this.guild.id, 'musicplayer.error_adding_track');
            return { success: false, message: errorMsg };
        }
    }

    /**
     * Downloads audio stream to a local file
     * Works with YouTube, Spotify, SoundCloud, and DirectLink
     */
    async downloadTrack(track, streamUrl, streamInfo) {
        // Generate unique filename based on URL to enable caching
        const hash = crypto.createHash('md5')
            .update(track.url)
            .digest('hex');
        const extension = '.opus';
        const filename = `track_${hash}${extension}`;
        const filepath = path.join(CACHE_DIR, filename);
        
        try {
            // Check if already downloaded (cache hit)
            if (fsSync.existsSync(filepath)) {
                const stats = await fs.stat(filepath);
                if (stats.size > 0) {
                    this.downloadedFiles.add(filepath);
                    this.scheduleStatePersist('download-cache-hit', 500);
                    return filepath;
                }
            }

            // Check if already downloading - wait for it to complete
            if (this.downloadingFiles.has(filepath)) {
                // Wait for the file to be downloaded (max 60 seconds)
                for (let i = 0; i < 60; i++) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    if (fsSync.existsSync(filepath)) {
                        const stats = await fs.stat(filepath);
                        if (stats.size > 0) {
                            this.downloadedFiles.add(filepath);
                            this.scheduleStatePersist('download-wait-complete', 500);
                            return filepath;
                        }
                    }
                }
                
                this.downloadingFiles.delete(filepath);
                throw new Error('Download timeout - file not ready after 60 seconds');
            }

            // Mark as downloading
            this.downloadingFiles.add(filepath);

            // For Spotify and SoundCloud - we need to use the YouTube URL
            // These platforms have DRM protection and can't be downloaded directly
            let downloadUrl = track.url;
            
            if (track.platform === 'spotify' || track.platform === 'soundcloud') {
                // For Spotify/SoundCloud, we must use the YouTube equivalent
                if (track.youtubeUrl) {
                    downloadUrl = track.youtubeUrl;
                } else {
                    // Search YouTube and use that URL
                    const YouTube = require('./YouTube');
                    const query = track.platform === 'spotify' 
                        ? `${track.title} ${track.artist}`
                        : track.title;
                    
                    const results = await YouTube.search(query, 1, this.guild?.id);
                    if (results && results.length > 0) {
                        downloadUrl = results[0].url;
                        track.youtubeUrl = downloadUrl; // Cache for future
                    } else {
                        this.downloadingFiles.delete(filepath);
                        throw new Error('Could not find YouTube equivalent');
                    }
                }
            }

            // For YouTube, Spotify (via YouTube), SoundCloud (via YouTube) - use youtube-dl-exec
            if (track.platform === 'youtube' || track.platform === 'spotify' || track.platform === 'soundcloud') {
                const youtubedl = require('youtube-dl-exec');
                
                await youtubedl(downloadUrl, {
                    output: filepath,
                    format: 'bestaudio',
                    noCheckCertificates: true,
                    noWarnings: true,
                    preferFreeFormats: true,
                    addHeader: [
                        'referer:youtube.com',
                        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    ],
                    postprocessorArgs: {
                        'ffmpeg': ['-c:a', 'libopus', '-b:a', '128k']
                    },
                    extractAudio: true,
                    audioFormat: 'opus'
                });
            } else {
                // For DirectLink - fetch and transcode with FFmpeg
                const fetch = await ensureFetch();
                const response = await fetch(streamUrl, {
                    headers: streamInfo?.httpHeaders || {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                if (!response.ok) {
                    this.downloadingFiles.delete(filepath);
                    throw new Error(`Failed to fetch: ${response.status}`);
                }

                let audioStream;
                if (typeof response.body?.getReader === 'function' && typeof Readable.fromWeb === 'function') {
                    audioStream = Readable.fromWeb(response.body);
                } else {
                    audioStream = response.body;
                }

                // Transcode to opus
                const ffmpegProcess = new prism.FFmpeg({
                    command: ffmpegPath,
                    args: [
                        '-i', 'pipe:0',
                        '-f', 'opus',
                        '-ar', '48000',
                        '-ac', '2',
                        '-b:a', '128k',
                        '-y',
                        filepath
                    ]
                });

                audioStream.pipe(ffmpegProcess);

                await new Promise((resolve, reject) => {
                    ffmpegProcess.on('close', (code) => {
                        if (code === 0) resolve();
                        else reject(new Error(`FFmpeg exited with code ${code}`));
                    });
                    ffmpegProcess.on('error', reject);
                });
            }

            // Verify file
            const stats = await fs.stat(filepath);
            if (stats.size === 0) {
                await fs.unlink(filepath).catch(() => {});
                this.downloadingFiles.delete(filepath);
                throw new Error('Downloaded file is empty');
            }

            this.downloadedFiles.add(filepath);
            this.downloadingFiles.delete(filepath); // Remove from downloading set
            this.scheduleStatePersist('download-complete', 500);
            return filepath;

        } catch (error) {
            this.downloadingFiles.delete(filepath); // Remove from downloading set on error
            console.error(`❌ Download failed for ${track.title}:`, error.message);
            throw error;
        }
    }

    /**
     * Deletes a downloaded audio file
     */
    async deleteDownloadedFile(filepath) {
        if (!filepath) return;

        try {
            await fs.unlink(filepath);
            this.downloadedFiles.delete(filepath);
            this.scheduleStatePersist('download-removed', 500);
        } catch (error) {
            if (error.code !== 'ENOENT') {
                console.error(`❌ Failed to delete file ${filepath}:`, error.message);
            }
        }
    }

    async play(trackIndex = null, seekMs = 0) {
        try {
            // If no current track, get from queue
            if (!this.currentTrack) {
                if (this.queue.length === 0) {
                    const errorMsg = await LanguageManager.getTranslation(this.guild.id, 'musicplayer.no_tracks_in_queue');
                    return { success: false, message: errorMsg };
                }
                this.currentTrack = this.queue.shift();
            }

            // If specific track requested
            if (trackIndex !== null && this.queue[trackIndex]) {
                this.currentTrack = this.queue.splice(trackIndex, 1)[0];
            }

            // Connect to voice channel if not connected
            if (!this.connection) {
                const connected = await this.connect();
                if (!connected) {
                    const errorMsg = await LanguageManager.getTranslation(this.guild.id, 'musicplayer.failed_connect_voice');
                    return { success: false, message: errorMsg };
                }
            }

            // Reset lifecycle flags for new playback
            this.pendingEndReason = null;
            this.skipRequested = false;
            this.stopRequested = false;
            const resumeFromMs = Math.max(0, Math.floor(Number(seekMs) || 0));
            const resumeFromSeconds = resumeFromMs / 1000;
            this.currentTrackStartOffsetMs = resumeFromMs;
            this.lastPlaybackPosition = resumeFromMs;
            this.pausedTime = 0;
            this.startTime = null; // Will be set when Playing event fires

            // Get audio stream - check preloaded first!
            let streamUrl = this.currentTrack.url;
            let streamInfo;

            // Try to reuse cache when resuming
            if (resumeFromMs > 0) {
                const cached = this.getCachedStreamForCurrentTrack(resumeFromSeconds);
                if (cached) {
                    streamInfo = cached;
                }
            }

            // Check if stream is already preloaded (only for fresh playback)
            const preloaded = (!streamInfo && resumeFromMs === 0)
                ? this.preloadedStreams.get(this.currentTrack.url)
                : null;
            if (!streamInfo && preloaded) {
                streamInfo = preloaded.info;
                // Remove from cache since we're using it
                this.preloadedStreams.delete(this.currentTrack.url);
            }

            if (!streamInfo) {
                // Get stream normally
                switch (this.currentTrack.platform) {
                    case 'youtube':
                        streamInfo = await YouTube.getStream(streamUrl, this.guild.id, resumeFromSeconds);
                        break;

                    case 'spotify':
                        // Enhanced YouTube search for Spotify tracks

                        // Enhanced search query with multiple attempts
                        const searchQueries = [
                            `"${this.currentTrack.title}" "${this.currentTrack.artist}"`, // Exact match
                            `${this.currentTrack.title} ${this.currentTrack.artist}`,     // Normal search
                            `${this.currentTrack.title}`                                  // Title only
                        ];

                        let ytTrack = null;
                        for (const query of searchQueries) {
                            try {
                                const results = await YouTube.search(query, 3, this.guild.id); // Get 3 results
                                if (results && results.length > 0) {
                                    // Prefer official videos or original versions
                                    ytTrack = results.find(r =>
                                        r.title.toLowerCase().includes('official') ||
                                        r.title.toLowerCase().includes(this.currentTrack.title.toLowerCase())
                                    ) || results[0];
                                    if (ytTrack) break;
                                }
                            } catch (e) {
                            }
                        }

                        if (ytTrack && ytTrack.url) {
                            streamUrl = ytTrack.url;
                            this.currentTrack.youtubeUrl = streamUrl;
                            this.currentTrack.youtubeTitle = ytTrack.title; // Store YouTube title
                            streamInfo = await YouTube.getStream(streamUrl, this.guild.id, resumeFromSeconds);
                        } else {
                            const errorMsg = await LanguageManager.getTranslation(this.guild.id, 'musicplayer.youtube_not_found_spotify').replace('{title}', this.currentTrack.title);
                            throw new Error(errorMsg);
                        }
                        break;

                    case 'soundcloud':
                        streamInfo = await SoundCloud.getStream(streamUrl, this.guild.id, resumeFromSeconds);
                        break;

                    case 'direct':
                        streamInfo = await DirectLink.getStream(streamUrl, resumeFromSeconds);
                        break;

                    default:
                        const errorMsg = await LanguageManager.getTranslation(this.guild.id, 'musicplayer.unsupported_platform').replace('{platform}', this.currentTrack.platform);
                        throw new Error(errorMsg);
                }
            }

            if (!streamInfo) {
                const errorMsg = await LanguageManager.getTranslation(this.guild.id, 'musicplayer.failed_get_audio_stream');
                throw new Error(errorMsg);
            }

            // Handle both old (string) and new (object) stream formats
            let streamUrl_final;

            if (typeof streamInfo === 'string') {
                streamUrl_final = streamInfo;
            } else if (streamInfo && typeof streamInfo === 'object') {
                if (streamInfo.stream) {
                    streamUrl_final = streamInfo.stream;
                } else {
                    streamUrl_final = streamInfo.url;
                }
            } else {
                streamUrl_final = streamInfo;
            }

            // Check if we can reuse the current downloaded file (for loop track mode)
            let downloadedFile;
            let shouldDownload = false;
            
            if (this.currentDownloadedFile && fsSync.existsSync(this.currentDownloadedFile)) {
                // Reuse existing file if it's the same track
               downloadedFile = this.currentDownloadedFile;
            } else {
                // Check if already pre-downloaded
                const hash = crypto.createHash('md5').update(this.currentTrack.url).digest('hex');
                const filepath = path.join(CACHE_DIR, `track_${hash}.opus`);
                
                if (fsSync.existsSync(filepath)) {
                    const stats = fsSync.statSync(filepath);
                    if (stats.size > 0) {
                        downloadedFile = filepath;
                        this.downloadedFiles.add(filepath);
                        this.currentDownloadedFile = filepath;
                    } else {
                        shouldDownload = true;
                    }
                } else {
                    shouldDownload = true;
                }
            }

            // If we need to download, start streaming immediately while downloading in background
            if (shouldDownload) {
                // Start download in background (don't await)
                const hash = crypto.createHash('md5').update(this.currentTrack.url).digest('hex');
                const filepath = path.join(CACHE_DIR, `track_${hash}.opus`);
                
                // Store track reference for background download (currentTrack might change)
                const trackToDownload = this.currentTrack;
                
                // Download in background
                this.downloadTrack(trackToDownload, streamUrl_final, streamInfo)
                    .then(file => {
                        // Only update if we're still on the same track
                        if (this.currentTrack && this.currentTrack.url === trackToDownload.url) {
                            this.currentDownloadedFile = file;
                        }
                    })
                    .catch(err => {
                        if (err && err.message) {
                            console.error(`⚠️ Background download failed: ${err.message}`);
                        }
                    });

                // Stream directly for immediate playback
                let audioStream;
                if (typeof streamInfo === 'object' && streamInfo.stream) {
                    audioStream = streamInfo.stream;
                } else if (typeof streamUrl_final === 'string') {
                    const fetch = await ensureFetch();
                    
                    try {
                        const response = await fetch(streamUrl_final, {
                            headers: streamInfo?.httpHeaders || {
                                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                            }
                        });
                        
                        if (!response.ok) throw new Error(`Failed to fetch stream: ${response.status}`);
                        
                        audioStream = typeof response.body?.getReader === 'function' && typeof Readable.fromWeb === 'function' 
                            ? Readable.fromWeb(response.body) 
                            : response.body;
                    } catch (fetchError) {
                        // Wait for download to complete
                        for (let i = 0; i < 30; i++) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                            if (fsSync.existsSync(filepath)) {
                                const stats = fsSync.statSync(filepath);
                                if (stats.size > 0) {
                                    shouldDownload = false; // Switch to file mode
                                    downloadedFile = filepath;
                                    break;
                                }
                            }
                        }
                        
                        if (!downloadedFile) throw fetchError;
                    }
                } else {
                    audioStream = streamUrl_final;
                }

                // If streaming failed and we got a downloaded file, skip to file playback
                if (!audioStream && downloadedFile) {
                    shouldDownload = false; // Fall through to file playback
                } else if (audioStream) {
                    // Create FFmpeg process for streaming
                    const seekArgs = resumeFromMs > 0 
                        ? ['-ss', (resumeFromMs / 1000).toFixed(3)] 
                        : [];
                    
                    const ffmpegProcess = new prism.FFmpeg({
                        command: ffmpegPath,
                        args: [
                            ...seekArgs,  // Add seek if resuming
                            '-analyzeduration', '0',
                            '-loglevel', '0',
                            '-i', 'pipe:0',
                            '-f', 's16le',
                            '-ar', '48000',
                            '-ac', '2'
                        ]
                    });

                    ffmpegProcess.on('error', (err) => {
                        if (err.message && err.message.includes('Premature close')) return;
                        console.error('❌ FFmpeg streaming error:', err.message);
                    });

                    audioStream.pipe(ffmpegProcess);

                    this.resource = createAudioResource(ffmpegProcess, {
                        inputType: StreamType.Raw,
                        inlineVolume: true,
                        metadata: {
                            title: this.currentTrack.title,
                            url: this.currentTrack.url,
                            duration: streamInfo.duration || this.currentTrack.duration,
                            bitrate: streamInfo.bitrate || 128
                        }
                    });
                }
            }
            
            // File playback mode (either pre-downloaded or fallback from streaming)
            if (!shouldDownload && downloadedFile) {
                console.log(`🎵 Playing from cached file: ${path.basename(downloadedFile)} (seek: ${resumeFromMs}ms)`);
                
                const seekArgs = resumeFromMs > 0 
                    ? ['-ss', (resumeFromMs / 1000).toFixed(3)] 
                    : [];
                
                const ffmpegProcess = new prism.FFmpeg({
                    command: ffmpegPath,
                    args: [
                        ...seekArgs,  // Add seek BEFORE input for faster seeking
                        '-i', downloadedFile,
                        '-analyzeduration', '0',
                        '-loglevel', '0',
                        '-f', 's16le',
                        '-ar', '48000',
                        '-ac', '2'
                    ]
                });

                ffmpegProcess.on('error', (err) => {
                    if (err.message && err.message.includes('Premature close')) return;
                    console.error('❌ FFmpeg playback error:', err.message);
                });

                this.resource = createAudioResource(ffmpegProcess, {
                    inputType: StreamType.Raw,
                    inlineVolume: true,
                    metadata: {
                        title: this.currentTrack.title,
                        url: this.currentTrack.url,
                        duration: (streamInfo && streamInfo.duration) || this.currentTrack.duration,
                        bitrate: (streamInfo && streamInfo.bitrate) || 128
                    }
                });
            }

            // Ensure we have a resource
            if (!this.resource) {
                throw new Error('Failed to create audio resource');
            }

            // Set volume
            if (this.resource.volume) {
                this.resource.volume.setVolume(this.volume / 100);
            }

            // Update track duration from stream info if available
            if (streamInfo && streamInfo.duration && streamInfo.duration > 0) {
                this.currentTrack.duration = streamInfo.duration;
            }

            console.log(`▶️  Playing: ${this.currentTrack.title} (${this.currentTrack.duration}s, offset: ${resumeFromMs}ms)`);

            // Play the resource
            this.audioPlayer.play(this.resource);

            if (this.pauseReasons.size > 0) {
                console.log(`⏸️  Paused due to: ${Array.from(this.pauseReasons).join(', ')}`);
                this.audioPlayer.pause();
            }

            // Store active stream info for quick resume
            const baseSourceUrl = typeof streamInfo === 'object'
                ? (streamInfo.rawUrl || streamInfo.url || (typeof streamUrl_final === 'string' ? streamUrl_final : null))
                : streamUrl_final;

            this.activeStreamInfo = {
                trackKey: this.getTrackCacheKey(this.currentTrack),
                platform: this.currentTrack.platform,
                fetchedAt: Date.now(),
                resumeSupported: typeof streamInfo === 'object' ? Boolean(streamInfo.canSeek) : false,
                baseUrl: baseSourceUrl,
                info: typeof streamInfo === 'object' ? streamInfo : { url: streamUrl_final }
            };

            // Cache current stream for future resume attempts
            this.currentTrackCache = this.activeStreamInfo;

            // Schedule watchdog to ensure proper completion and prevent premature transitions
            this.scheduleTrackWatchdog(streamInfo);

            this.startStateSync();
            await this.persistState(resumeFromMs > 0 ? 'resume-playback' : 'play');

            // Fetch and start lyrics system
            this.fetchAndStartLyrics();

            return { success: true, track: this.currentTrack };

        } catch (error) {
            // Clean up downloaded file on error
            if (this.currentDownloadedFile) {
                await this.deleteDownloadedFile(this.currentDownloadedFile);
                this.currentDownloadedFile = null;
            }

            await this.handleError(error);
            const errorMsg = await LanguageManager.getTranslation(this.guild.id, 'musicplayer.track_could_not_play');
            return { success: false, message: errorMsg };
        }
    }

    scheduleTrackWatchdog(streamInfo = null) {
        if (this.trackTimer) {
            clearTimeout(this.trackTimer);
        }

        const streamDuration = streamInfo && Number(streamInfo.duration) > 0 ? Number(streamInfo.duration) : null;
        const trackDuration = this.currentTrack && Number(this.currentTrack.duration) > 0 ? Number(this.currentTrack.duration) : null;
        const durationSeconds = streamDuration || trackDuration;

        if (durationSeconds && durationSeconds > 0) {
            // Calculate remaining time considering the start offset (in seconds)
            const startOffsetSeconds = Math.floor((this.currentTrackStartOffsetMs || 0) / 1000);
            const remainingSeconds = Math.max(1, durationSeconds - startOffsetSeconds);
            
            this.expectedTrackEndTs = Date.now() + (remainingSeconds * 1000);
            // Add 4 seconds buffer, but ensure minimum 5 seconds timeout
            const timeoutMs = Math.max(remainingSeconds * 1000 + 4000, 5000);
            
            console.log(`🕒 Track watchdog: ${remainingSeconds}s remaining (${durationSeconds}s total, ${startOffsetSeconds}s offset)`);
            this.trackTimer = setTimeout(() => this.ensureTrackCompletion(), timeoutMs);
        } else {
            // Fallback watchdog: check every 5 minutes for streams without known duration
            this.expectedTrackEndTs = null;
            this.trackTimer = setTimeout(() => this.ensureTrackCompletion(), 5 * 60 * 1000);
        }
    }

    getTrackCacheKey(track) {
        if (!track) return null;
        return track.id || track.url || `${track.title}-${track.duration}`;
    }

    getCachedStreamForCurrentTrack(seekSeconds) {
        if (!this.currentTrackCache) return null;
        const key = this.getTrackCacheKey(this.currentTrack);
        if (!key || this.currentTrackCache.trackKey !== key) return null;
        if (!this.currentTrackCache.resumeSupported || !this.currentTrackCache.baseUrl) return null;
        const seekUrl = this.applySeekToUrl(this.currentTrackCache.baseUrl, seekSeconds);
        if (!seekUrl) return null;

        return {
            ...this.currentTrackCache.info,
            url: seekUrl,
            canSeek: true,
            fromCache: true,
            duration: this.currentTrackCache.info?.duration || this.currentTrack.duration
        };
    }

    applySeekToUrl(baseUrl, seekSeconds) {
        if (!baseUrl) return null;
        if (seekSeconds <= 0) return baseUrl;

        let url = baseUrl.replace(/(&|\?)begin=\d+/g, '');
        url = url.replace(/(&|\?)start=\d+/g, '');

        const isYouTubeStream = /googlevideo\.com/i.test(url);
        if (!isYouTubeStream) {
            // TODO: add support for other providers when available
            return null;
        }

        const separator = url.includes('?') ? '&' : '?';
        const startMs = Math.max(0, Math.floor(seekSeconds * 1000));
        return `${url}${separator}begin=${startMs}`;
    }

    ensureTrackCompletion() {
        if (!this.currentTrack) {
            this.trackTimer = null;
            return;
        }

        const status = this.audioPlayer.state?.status;

        if (status === AudioPlayerStatus.Playing) {
            const playbackMs = this.resource?.playbackDuration || 0;
            const durationMs = (Number(this.currentTrack.duration) || 0) * 1000;

            if (durationMs > 0 && playbackMs + 1500 < durationMs) {
                const remainingMs = Math.max(durationMs - playbackMs, 2000);
                this.trackTimer = setTimeout(() => this.ensureTrackCompletion(), remainingMs);
                return;
            }

            // Gracefully stop to emit Idle and let lifecycle handler run
            if (!this.pendingEndReason) {
                this.pendingEndReason = 'watchdog';
            }
            this.audioPlayer.stop();
            this.trackTimer = null;
            return;
        }

        if (status === AudioPlayerStatus.Idle || status === AudioPlayerStatus.AutoPaused) {
            // Idle handler will take care, nothing to do
            this.trackTimer = null;
            return;
        }

        // Unknown state, keep watching
        this.trackTimer = setTimeout(() => this.ensureTrackCompletion(), 2000);
    }

    onPlayerIdle(trigger = 'idle') {
        const reason = this.consumePendingEndReason(trigger);

        // Slight delay to allow playback stats to finalize
        setTimeout(() => {
            this.handleTrackEnd(reason).catch(console.error);
        }, 60);
    }

    consumePendingEndReason(defaultReason = 'idle') {
        const reason = this.pendingEndReason || defaultReason;
        this.pendingEndReason = null;
        return reason;
    }

    pause(reason = 'manual') {
        return this.pauseFor(reason);
    }

    resume(reason = 'manual') {
        return this.resumeFor(reason);
    }

    pauseFor(reason = null) {
        if (reason) {
            this.pauseReasons.add(reason);
            this.scheduleStatePersist('pause-update', 200);
        }

        const status = this.audioPlayer.state.status;
        if (status === AudioPlayerStatus.Paused) {
            this.paused = true;
            this.scheduleStatePersist('pause', 0);
            return true;
        }

        if (status === AudioPlayerStatus.Playing) {
            const paused = this.audioPlayer.pause();
            if (paused) {
                this.paused = true;
                this.scheduleStatePersist('pause', 0);
                return true;
            }
        }

        return false;
    }

    resumeFor(reason = null) {
        if (reason) {
            this.pauseReasons.delete(reason);
            this.scheduleStatePersist('resume-update', 200);
        }

        if (this.pauseReasons.size > 0) {
            return false;
        }

        const status = this.audioPlayer.state.status;
        if (status === AudioPlayerStatus.Paused) {
            const resumed = this.audioPlayer.unpause();
            if (resumed) {
                this.paused = false;
                this.scheduleStatePersist('resume', 0);
                return true;
            }
            return false;
        }

        if (status === AudioPlayerStatus.Playing) {
            this.paused = false;
            this.scheduleStatePersist('resume', 0);
            return true;
        }

        return false;
    }

    startInactivityTimer() {
        if (this.inactivityTimer) return;

        this.pauseFor('alone');

        this.inactivityTimer = setTimeout(async () => {
            this.inactivityTimer = null;

            const channelId = this.voiceChannel?.id;
            const channel = channelId ? this.guild.channels.cache.get(channelId) : null;
            const hasListeners = channel ? channel.members.filter(member => !member.user.bot).size > 0 : false;

            if (hasListeners) {
                this.resumeFor('alone');
                if (global.clients?.musicEmbedManager) {
                    await global.clients.musicEmbedManager.updateNowPlayingEmbed(this);
                }
                return;
            }

            this.pauseReasons.clear();
            this.pendingEndReason = 'inactivity-timeout';
            this.queue = [];
            this.currentTrack = null;

            try {
                const embedManager = global.clients?.musicEmbedManager;
                if (embedManager) {
                    await embedManager.handlePlaybackEnd(this);
                } else if (typeof this.showQueueCompleted === 'function') {
                    await this.showQueueCompleted();
                }

                await this.persistState('inactivity-timeout');
            } catch (error) {
                console.error('❌ Failed to update playback UI after inactivity timeout:', error);
            } finally {
                try {
                    this.cleanup();
                } finally {
                    const client = this.guild?.client;
                    if (client?.players) {
                        client.players.delete(this.guild.id);
                    }
                }
            }
        }, Math.max(this.inactivityTimeoutMs, 0));
    }

    clearInactivityTimer(shouldResume = true) {
        if (this.inactivityTimer) {
            clearTimeout(this.inactivityTimer);
            this.inactivityTimer = null;
        }

        if (shouldResume) {
            this.resumeFor('alone');
        } else {
            this.pauseReasons.delete('alone');
        }
    }

    stop() {
        this.clearInactivityTimer(false);
        this.pauseReasons.clear();
        this.paused = false;

        this.stopStateSync();
        if (this.guild?.id) {
            PlayerStateManager.removeState(this.guild.id).catch(() => {});
        }

        // Clear track timer
        if (this.trackTimer) {
            clearTimeout(this.trackTimer);
            this.trackTimer = null;
        }

        // Clean up current downloaded file
        if (this.currentDownloadedFile) {
            this.deleteDownloadedFile(this.currentDownloadedFile);
            this.currentDownloadedFile = null;
        }

        // Clean up all downloaded files
        for (const filepath of this.downloadedFiles) {
            this.deleteDownloadedFile(filepath);
        }
        this.downloadedFiles.clear();

        this.queue = [];
        this.currentTrack = null;
        this.pendingEndReason = 'stop';
        this.stopRequested = true;
        this.currentTrackStartOffsetMs = 0;
        this.lastPlaybackPosition = 0;
        this.audioPlayer.stop(true);
        this.disconnect();
    }

    skip() {
        if (this.currentTrack) {
            // Clear track timer
            if (this.trackTimer) {
                clearTimeout(this.trackTimer);
                this.trackTimer = null;
            }

            this.pendingEndReason = 'skip';
            this.skipRequested = true;
            this.audioPlayer.stop(true);
            this.scheduleStatePersist('skip', 0);
            return true;
        }
        return false;
    }

    previous() {
        if (this.previousTracks.length > 0) {
            if (this.currentTrack) {
                this.queue.unshift(this.currentTrack);
            }
            this.currentTrack = this.previousTracks.pop();
            this.audioPlayer.stop(); // This will trigger play
            this.scheduleStatePersist('previous', 0);
            return true;
        }
        return false;
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(100, volume));
        if (this.resource && this.resource.volume) {
            this.resource.volume.setVolume(this.volume / 100);
        }
        this.scheduleStatePersist('volume', 200);
        return this.volume;
    }

    shuffleQueue() {
        if (this.queue.length > 1) {
            for (let i = this.queue.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.queue[i], this.queue[j]] = [this.queue[j], this.queue[i]];
            }
            this.scheduleStatePersist('shuffle-queue', 200);
            return true;
        }
        return false;
    }

    setLoop(mode) {
        // mode: false, 'track', 'queue'
        this.loop = mode;
        this.scheduleStatePersist('loop', 200);
        return this.loop;
    }

    setShuffle(enabled) {
        this.shuffle = enabled;
        this.scheduleStatePersist('shuffle-toggle', 200);
        return this.shuffle;
    }

    clearQueue() {
        const cleared = this.queue.length;
        this.queue = [];
        this.scheduleStatePersist('clear-queue', 0);
        return cleared;
    }

    removeFromQueue(index) {
        if (index >= 0 && index < this.queue.length) {
            const removed = this.queue.splice(index, 1)[0];
            this.scheduleStatePersist('queue-remove', 200);
            return removed;
        }
        return null;
    }

    moveInQueue(from, to) {
        if (from >= 0 && from < this.queue.length && to >= 0 && to < this.queue.length) {
            const track = this.queue.splice(from, 1)[0];
            this.queue.splice(to, 0, track);
            this.scheduleStatePersist('queue-move', 200);
            return true;
        }
        return false;
    }

    getQueue() {
        return {
            current: this.currentTrack,
            queue: this.queue,
            previous: this.previousTracks,
            totalTracks: (this.currentTrack ? 1 : 0) + this.queue.length,
            duration: this.getTotalDuration(),
        };
    }

    getTotalDuration() {
        let total = 0;
        if (this.currentTrack && this.currentTrack.duration) {
            total += this.currentTrack.duration;
        }
        this.queue.forEach(track => {
            if (track.duration) total += track.duration;
        });
        return total;
    }

    getCurrentTime() {
        const playbackDuration = this.audioPlayer?.state?.resource?.playbackDuration;
        if (typeof playbackDuration === 'number' && Number.isFinite(playbackDuration)) {
            return this.currentTrackStartOffsetMs + playbackDuration;
        }

        if (!this.startTime) return this.currentTrackStartOffsetMs;
        if (this.paused) {
            return this.currentTrackStartOffsetMs + this.pausedTime;
        }
        return this.currentTrackStartOffsetMs + (Date.now() - this.startTime) + this.pausedTime;
    }

    // Timer-based track completion - no more unreliable Idle events!

    async handleTrackEnd(reason = 'idle') {
        if (this.isTransitioning) {
            return;
        }

        this.isTransitioning = true;

        try {
            if (this.trackTimer) {
                clearTimeout(this.trackTimer);
                this.trackTimer = null;
            }

            const finishedTrack = this.currentTrack;
            const playbackMs = this.resource?.playbackDuration || 0;
            const totalPlaybackMs = this.currentTrackStartOffsetMs + playbackMs;
            this.lastPlaybackPosition = totalPlaybackMs;
            const durationMs = finishedTrack && Number(finishedTrack.duration) > 0 ? Number(finishedTrack.duration) * 1000 : 0;
            const manualSkip = reason === 'skip' || reason === 'stop';
            const endedUnexpectedly = Boolean(finishedTrack) && !manualSkip && durationMs > 0 && totalPlaybackMs + 1500 < durationMs;

            if (endedUnexpectedly) {
                this.currentTrackRetries += 1;
                if (this.currentTrackRetries <= 2) {
                    // Attempt to resume the same track from the last known position
                    await this.play(null, totalPlaybackMs);
                    return;
                } else {
                }
            } else {
                this.currentTrackRetries = 0;
            }

            if (!finishedTrack) {
                this.resource = null;
                return;
            }

            this.previousTracks.push(finishedTrack);

            // Clean up downloaded file for finished track (unless looping track)
            if (this.loop !== 'track' && this.currentDownloadedFile) {
                await this.deleteDownloadedFile(this.currentDownloadedFile);
                this.currentDownloadedFile = null;
            }

            if (this.loop === 'track') {
                // Loop track from beginning
                await this.play(null, 0);
                return;
            }

            if (this.loop === 'queue') {
                this.queue.push(finishedTrack);
            }

            this.resource = null;
            this.expectedTrackEndTs = null;
            this.startTime = null;
            this.pausedTime = 0;
            this.lastPlaybackPosition = 0;
            this.currentTrackStartOffsetMs = 0;
            this.currentTrackCache = null;

            if (this.queue.length > 0) {
                if (this.shuffle) {
                    const randomIndex = Math.floor(Math.random() * this.queue.length);
                    this.currentTrack = this.queue.splice(randomIndex, 1)[0];
                } else {
                    this.currentTrack = this.queue.shift();
                }

                // Play next track from beginning
                await this.play(null, 0);

                const MusicEmbedManager = require('./MusicEmbedManager');
                if (global.clients && global.clients.musicEmbedManager) {
                    await global.clients.musicEmbedManager.updateNowPlayingEmbed(this);
                }

                return;
            }

            if (this.autoplay) {
                this.currentTrackRetries = 0;
                await this.handleAutoplay();
                return;
            }

            this.currentTrack = null;
            this.currentTrackCache = null;
            this.currentTrackStartOffsetMs = 0;

            const MusicEmbedManager = require('./MusicEmbedManager');
            if (global.clients && global.clients.musicEmbedManager) {
                await global.clients.musicEmbedManager.handlePlaybackEnd(this);
            } else {
                await this.showQueueCompleted();
            }

            this.clearInactivityTimer(false);
            if (this.guild?.id) {
                await PlayerStateManager.removeState(this.guild.id);
            }

            setTimeout(() => {
                if (this.queue.length === 0 && !this.currentTrack) {
                    this.cleanup();
                    const clientInstance = this.guild?.client;
                    if (clientInstance?.players) {
                        clientInstance.players.delete(this.guild.id);
                    }
                }
            }, 10000);
        } finally {
            this.isTransitioning = false;
            this.skipRequested = false;
            this.stopRequested = false;
            this.pendingEndReason = null;
        }
    }

    async handleAutoplay() {
        if (!this.autoplay || typeof this.autoplay !== 'string') return;

        try {
            // Genre-specific search keywords
            const genreKeywords = {
                pop: ['pop music 2024', 'top pop songs', 'pop hits official', 'best pop music'],
                rock: ['rock music official', 'rock songs 2024', 'classic rock hits', 'best rock music'],
                hiphop: ['hip hop music', 'rap songs official', 'hip hop 2024', 'best rap music'],
                electronic: ['edm music', 'electronic dance music', 'house music official', 'best edm'],
                jazz: ['jazz music', 'jazz standards', 'smooth jazz official', 'best jazz'],
                classical: ['classical music', 'classical piano', 'orchestra music', 'best classical'],
                metal: ['metal music official', 'heavy metal songs', 'metal 2024', 'best metal'],
                country: ['country music official', 'country songs 2024', 'best country music'],
                rnb: ['r&b music official', 'rnb songs 2024', 'soul music', 'best rnb'],
                indie: ['indie music official', 'indie songs 2024', 'alternative music', 'best indie'],
                latin: ['latin music official', 'reggaeton 2024', 'latin hits', 'best latin music'],
                kpop: ['kpop official mv', 'kpop songs 2024', 'korean music official', 'best kpop'],
                anime: ['anime opening official', 'anime songs official', 'anime music 2024', 'best anime op'],
                lofi: ['lofi hip hop music', 'lofi beats official', 'chill lofi music', 'best lofi'],
                blues: ['blues music official', 'blues songs', 'blues guitar music', 'best blues'],
                reggae: ['reggae music official', 'reggae songs 2024', 'best reggae music'],
                disco: ['disco music official', 'disco hits', 'best disco music'],
                punk: ['punk rock official', 'punk music 2024', 'pop punk songs', 'best punk'],
                ambient: ['ambient music official', 'ambient soundscape', 'atmospheric music', 'best ambient'],
                random: ['music official video', 'top songs 2024', 'music video official', 'best music']
            };

            const keywords = genreKeywords[this.autoplay] || genreKeywords.random;
            const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];

            // Search YouTube for random track
            const YouTube = require('./YouTube');
            const results = await YouTube.search(randomKeyword, 15, this.guild.id);

            if (!results || results.length === 0) {
                return;
            }

            // Filter out non-music content
            const filteredResults = results.filter(track => {
                // Skip if duration is missing
                if (!track.duration) return false;
                
                // Duration limits: 30 seconds to 10 minutes (600 seconds)
                // This filters out most tutorials, lessons, podcasts, and full movies
                if (track.duration < 30 || track.duration > 600) return false;
                
                // Filter out common non-music keywords in title
                const title = (track.title || '').toLowerCase();
                const blockedKeywords = [
                    'tutorial', 'lesson', 'course', 'learn', 'learning',
                    'podcast', 'interview', 'talk', 'speech', 'lecture',
                    'review', 'unboxing', 'reaction', 'gameplay',
                    'full movie', 'full album', 'full episode', 'documentary',
                    'how to', 'guide', 'tips', 'tricks', 'vlog',
                    'practice', 'exercise', 'workout', 'meditation',
                    'asmr', 'story', 'audiobook', 'mix |', 'compilation'
                ];
                
                // Check if title contains any blocked keywords
                const hasBlockedKeyword = blockedKeywords.some(keyword => title.includes(keyword));
                if (hasBlockedKeyword) return false;
                
                // Filter out playlist-like content (mixes and compilations often have many emojis or brackets)
                const emojiCount = (title.match(/[\u{1F300}-\u{1F9FF}]/gu) || []).length;
                const bracketCount = (title.match(/[\[\]【】]/g) || []).length;
                if (emojiCount > 3 || bracketCount > 4) return false;
                
                return true;
            });

            if (filteredResults.length === 0) {
                // Try again with a different keyword
                const fallbackKeyword = keywords[Math.floor(Math.random() * keywords.length)];
                const fallbackResults = await YouTube.search(fallbackKeyword, 10, this.guild.id);
                const fallbackFiltered = (fallbackResults || []).filter(track => 
                    track.duration >= 30 && track.duration <= 600
                );
                
                if (fallbackFiltered.length === 0) {
                    return;
                }
                
                filteredResults.push(...fallbackFiltered);
            }

            // Pick random track from filtered results
            const randomTrack = filteredResults[Math.floor(Math.random() * filteredResults.length)];
            randomTrack.requestedBy = this.guild.members.me.user;
            randomTrack.addedAt = Date.now();

            // Add to queue
            this.queue.push(randomTrack);
           
            // Preload track
            this.preloadTrack(randomTrack).catch(err => {
                if (err && err.message) {
                    console.error(`❌ Autoplay preload failed: ${err.message}`);
                }
            });

            // Start playing from beginning
            this.currentTrack = this.queue.shift();
            await this.play(null, 0);

            // Update now playing embed for autoplay track
            const MusicEmbedManager = require('./MusicEmbedManager');
            if (global.clients && global.clients.musicEmbedManager) {
                await global.clients.musicEmbedManager.updateNowPlayingEmbed(this);
            }

        } catch (error) {
            console.error('❌ Autoplay error:', error.message);
        }
    }

    async handleError(error) {

        // Try to skip to next track on error
        if (this.queue.length > 0) {
            this.currentTrack = this.queue.shift();
            await this.play(null, 0);
        } else {
            this.currentTrack = null;
            const errorMsg = await LanguageManager.getTranslation(this.guild.id, 'musicplayer.error_playlist_stopped');
            await this.textChannel.send(errorMsg);
        }
    }

    detectPlatform(query) {

        if (query.includes('youtube.com') || query.includes('youtu.be')) {
            return 'youtube';
        } else if (query.includes('spotify.com')) {
            return 'spotify';
        } else if (query.includes('soundcloud.com')) {
            return 'soundcloud';
        } else if (query.match(/^https?:\/\/.*\.(mp3|wav|ogg|flac|m4a|aac|wma|opus|webm|mp4)$/i)) {
            return 'direct';
        }
        return 'youtube'; // Default to YouTube search
    }

    // Preloading System
    async preloadTrack(track) {
        if (!track || !track.url) return;

        // Check if already downloaded
        const hash = crypto.createHash('md5').update(track.url).digest('hex');
        const filepath = path.join(CACHE_DIR, `track_${hash}.opus`);
        
        if (fsSync.existsSync(filepath)) {
            const stats = fsSync.statSync(filepath);
            if (stats.size > 0) {
                return; // Already downloaded
            }
        }

        // Check if already preloading/downloading (including downloadingFiles set)
        if (this.preloadedStreams.has(track.url) || 
            this.preloadingQueue.includes(track.url) ||
            this.downloadingFiles.has(filepath)) {
            return;
        }

        this.preloadingQueue.push(track.url);

        try {
            let streamUrl = track.url;
            let streamInfo;

            // Get stream URL first
            switch (track.platform) {
                case 'youtube':
                    streamInfo = await YouTube.getStream(streamUrl, this.guild.id);
                    break;
                case 'spotify':
                    // Use cached YouTube URL if available
                    if (track.youtubeUrl) {
                        streamUrl = track.youtubeUrl;
                        streamInfo = await YouTube.getStream(streamUrl, this.guild.id);
                    } else {
                        // Quick YouTube search for Spotify
                        const query = `"${track.title}" "${track.artist}"`;
                        const results = await YouTube.search(query, 1, this.guild.id);
                        if (results && results.length > 0) {
                            streamUrl = results[0].url;
                            track.youtubeUrl = streamUrl; // Cache for future use
                            streamInfo = await YouTube.getStream(streamUrl, this.guild.id);
                        }
                    }
                    break;
                case 'soundcloud':
                    streamInfo = await SoundCloud.getStream(streamUrl, this.guild.id);
                    break;
                case 'direct':
                    streamInfo = await DirectLink.getStream(streamUrl);
                    break;
            }

            if (streamInfo) {
                // Download track in background
                let streamUrl_final;
                if (typeof streamInfo === 'string') {
                    streamUrl_final = streamInfo;
                } else if (streamInfo && typeof streamInfo === 'object') {
                    streamUrl_final = streamInfo.stream || streamInfo.url;
                } else {
                    streamUrl_final = streamInfo;
                }

                await this.downloadTrack(track, streamUrl_final, streamInfo);
                
                // Mark as preloaded
                this.preloadedStreams.set(track.url, {
                    info: streamInfo,
                    track: track,
                    downloaded: true
                });
            }
        } catch (error) {
            if (error && error.message) {
                console.error(`❌ Pre-download failed for ${track.title}:`, error.message);
            }
        } finally {
            // Remove from preloading queue
            const index = this.preloadingQueue.indexOf(track.url);
            if (index > -1) this.preloadingQueue.splice(index, 1);
        }
    }

    getPlatformEmoji(platform) {
        const emojis = {
            youtube: '🔴',
            spotify: '🟢',
            soundcloud: '🟠',
            direct: '🔗'
        };
        return emojis[platform] || '🎵';
    }

    async showQueueCompleted() {
        if (!this.nowPlayingMessage || !this.textChannel) return;

        try {
            const completedTitle = await LanguageManager.getTranslation(this.guild.id, 'musicplayer.queue_completed');
            const completedDesc = await LanguageManager.getTranslation(this.guild.id, 'musicplayer.queue_completed_desc');

            const embed = new EmbedBuilder()
                .setTitle(completedTitle)
                .setDescription(completedDesc)
                .setColor('#00ff00')
                .setTimestamp();

            // Create disabled buttons
            const disabledButtons = await this.createControlButtons(true);

            await this.nowPlayingMessage.edit({
                embeds: [embed],
                components: disabledButtons
            });

        } catch (error) {
            // Message might be deleted, clear reference
            this.nowPlayingMessage = null;
        }
    }

    serializeTrack(track) {
        if (!track) return null;

        const requester = track.requestedBy || null;
        const requesterId = requester?.id || track.requesterId || null;
        const requesterTag = requester?.tag || requester?.user?.tag || track.requesterTag || null;

        return {
            id: track.id || null,
            title: track.title || null,
            url: track.url || null,
            duration: typeof track.duration === 'number' ? track.duration : Number(track.duration) || null,
            thumbnail: track.thumbnail || null,
            artist: track.artist || null,
            album: track.album || null,
            platform: track.platform || null,
            uploader: track.uploader || null,
            youtubeUrl: track.youtubeUrl || null,
            soundcloudUrl: track.soundcloudUrl || null,
            spotifyUrl: track.spotifyUrl || null,
            isLive: track.isLive || track.live || false,
            addedAt: track.addedAt || Date.now(),
            requesterId,
            requesterTag,
            extra: track.extra || null
        };
    }

    deserializeTrack(data) {
        if (!data) return null;

        const track = {
            id: data.id || null,
            title: data.title || null,
            url: data.url || null,
            duration: typeof data.duration === 'number' ? data.duration : Number(data.duration) || null,
            thumbnail: data.thumbnail || null,
            artist: data.artist || null,
            album: data.album || null,
            platform: data.platform || null,
            uploader: data.uploader || null,
            youtubeUrl: data.youtubeUrl || null,
            soundcloudUrl: data.soundcloudUrl || null,
            spotifyUrl: data.spotifyUrl || null,
            isLive: Boolean(data.isLive),
            addedAt: data.addedAt || Date.now(),
            extra: data.extra || null
        };

        if (data.requesterId) {
            const cachedMember = this.guild?.members?.cache?.get?.(data.requesterId) || null;
            track.requestedBy = cachedMember || { id: data.requesterId, tag: data.requesterTag || data.requesterId };
            track.requesterId = data.requesterId;
            track.requesterTag = data.requesterTag || null;
        }

        return track;
    }

    serializeState() {
        const guildId = this.guild?.id;
        if (!guildId) return null;

        return {
            guildId,
            voiceChannelId: this.voiceChannel?.id || null,
            textChannelId: this.textChannel?.id || null,
            currentTrack: this.serializeTrack(this.currentTrack),
            queue: this.queue.map(track => this.serializeTrack(track)).filter(Boolean),
            previousTracks: this.previousTracks.slice(-10).map(track => this.serializeTrack(track)).filter(Boolean),
            volume: this.volume,
            loop: this.loop,
            shuffle: this.shuffle,
            autoplay: this.autoplay,
            paused: this.paused,
            pauseReasons: Array.from(this.pauseReasons || []),
            playbackPositionMs: this.getCurrentTime() || 0,
            currentTrackStartOffsetMs: this.currentTrackStartOffsetMs || 0,
            lastPlaybackPosition: this.lastPlaybackPosition || 0,
            requesterId: this.requesterId || null,
            nowPlayingMessageId: this.nowPlayingMessage?.id || null,
            nowPlayingChannelId: this.nowPlayingMessage?.channelId || this.textChannel?.id || null,
            sessionId: this.sessionId,
            downloadedFiles: Array.from(this.downloadedFiles || [])
                .filter(Boolean)
                .map(filepath => path.resolve(filepath)),
            currentDownloadedFile: this.currentDownloadedFile ? path.resolve(this.currentDownloadedFile) : null,
            updatedAt: Date.now()
        };
    }

    async restoreFromState(state) {
        if (!state || !this.guild?.id) return;
        this.stopStateSync();
        this.pauseReasons = new Set();
        this.preloadedStreams.clear();
        this.preloadingQueue = [];

        this.volume = typeof state.volume === 'number' ? state.volume : this.volume;
        this.loop = state.loop ?? false;
        this.shuffle = state.shuffle ?? false;
        this.autoplay = state.autoplay ?? false;
        this.requesterId = state.requesterId || this.requesterId;

        this.previousTracks = (state.previousTracks || [])
            .map(serialized => this.deserializeTrack(serialized))
            .filter(Boolean);

        const restoredQueue = (state.queue || [])
            .map(serialized => this.deserializeTrack(serialized))
            .filter(Boolean);

        this.queue = restoredQueue;
        this.currentTrack = this.deserializeTrack(state.currentTrack) || null;

        if (!this.currentTrack && this.queue.length > 0) {
            this.currentTrack = this.queue.shift();
        }

        const validDownloads = new Set();
        for (const file of state.downloadedFiles || []) {
            if (!file) continue;
            try {
                // Resolve relative paths against CACHE_DIR
                const fullPath = path.isAbsolute(file) ? file : path.join(CACHE_DIR, file);
                if (fsSync.existsSync(fullPath)) {
                    validDownloads.add(path.resolve(fullPath));
                } else {
                    console.log(`❌ Missing cached file: ${path.basename(file)}`);
                }
            } catch (error) {
                console.log(`⚠️ Error checking file ${path.basename(file)}: ${error.message}`);
            }
        }
        this.downloadedFiles = validDownloads;

        if (state.currentDownloadedFile) {
            const fullPath = path.isAbsolute(state.currentDownloadedFile) ? state.currentDownloadedFile : path.join(CACHE_DIR, state.currentDownloadedFile);
            if (fsSync.existsSync(fullPath)) {
                this.currentDownloadedFile = path.resolve(fullPath);
            } else {
                this.currentDownloadedFile = null;
            }
         } else {
            this.currentDownloadedFile = null;
         }

        const resumeMsRaw = Number(state.playbackPositionMs) || 0;
        const trackDurationMs = this.currentTrack?.duration ? Number(this.currentTrack.duration) * 1000 : null;
        let resumeMs = Math.max(0, resumeMsRaw);
        if (trackDurationMs && resumeMs > Math.max(trackDurationMs - 2000, 0)) {
            resumeMs = 0;
        }

        this.currentTrackStartOffsetMs = Math.max(Number(state.currentTrackStartOffsetMs) || 0, 0);
        this.lastPlaybackPosition = resumeMs;
        this.paused = false;

        if (!this.connection) {
            try {
                const connected = await this.connect();
                if (!connected) {
                    throw new Error('Failed to reconnect to voice channel');
                }
            } catch (error) {
                console.error('❌ Failed to connect during restore:', error.message);
                throw new Error('Failed to reconnect to voice channel');
            }
        }

        if (!this.currentTrack) {
            await PlayerStateManager.removeState(this.guild.id);
            return;
        }

        await this.play(null, resumeMs);

        if (this.resource?.volume) {
            this.resource.volume.setVolume(this.volume / 100);
        }

        const embedManager = global.clients?.musicEmbedManager;
        if (embedManager && this.textChannel) {
            try {
                const embed = await embedManager.createNowPlayingEmbed(this, this.currentTrack, this.guild.id);
                const buttons = await embedManager.createControlButtons(this);

                let nowPlayingMessage = null;
                if (state.nowPlayingMessageId) {
                    nowPlayingMessage = await this.textChannel.messages.fetch(state.nowPlayingMessageId).catch(() => null);
                }

                if (nowPlayingMessage) {
                    await nowPlayingMessage.edit({ embeds: [embed], components: buttons });
                    this.nowPlayingMessage = nowPlayingMessage;
                } else {
                    this.nowPlayingMessage = await this.textChannel.send({ embeds: [embed], components: buttons });
                }
            } catch (error) {
                console.error('❌ Failed to rebuild now playing embed during restore:', error?.message || error);
            }
        }

        if (this.textChannel && this.currentTrack) {
            try {
                const resumeMessage = await LanguageManager.getTranslation(this.guild.id, 'buttonhandler.music_resumed');
                const positionSeconds = Math.floor(resumeMs / 1000);
                const positionFormatted = this.formatDuration(positionSeconds);

                await this.textChannel.send({
                    content: `▶️ ${resumeMessage} • **${this.currentTrack.title || 'Unknown'}** (${positionFormatted})`
                });
            } catch (error) {
                // Ignore if message cannot be sent
            }
        }

        this.scheduleStatePersist('restored', 1000);
    }

    async persistState(reason = 'manual', immediate = false) {
        try {
            if (!this.guild?.id) return;

            // Cancel pending save if this is immediate
            if (immediate && this.pendingStateSave) {
                clearTimeout(this.pendingStateSave);
                this.pendingStateSave = null;
            }

            if (!this.currentTrack && this.queue.length === 0) {
                await PlayerStateManager.removeState(this.guild.id);
                return;
            }

            const state = this.serializeState();
            if (!state) {
                await PlayerStateManager.removeState(this.guild.id);
                return;
            }

            state.reason = reason;
            await PlayerStateManager.saveState(this.guild.id, state);
        } catch (error) {
            console.error(`❌ Failed to persist player state for guild ${this.guild?.id}:`, error.message || error);
        }
    }

    startStateSync() {
        if (this.stateSyncInterval) return;

        this.stateSyncInterval = setInterval(() => {
            if (!this.guild?.id) return;
            if (!this.currentTrack && this.queue.length === 0) return;

            this.persistState('interval').catch(() => {});
        }, this.stateSyncIntervalMs);
    }

    stopStateSync() {
        if (this.stateSyncInterval) {
            clearInterval(this.stateSyncInterval);
            this.stateSyncInterval = null;
        }

        this.cancelStateSave();
    }

    cancelStateSave() {
        if (this.stateSaveTimeout) {
            clearTimeout(this.stateSaveTimeout);
            this.stateSaveTimeout = null;
        }
    }

    // ==================== LYRICS SYSTEM ====================

    async fetchAndStartLyrics() {
        try {
            if (!this.currentTrack) return;

            // Fetch lyrics in background (no sync, button-only display)
            this.currentLyrics = await LyricsManager.fetchLyrics(this.currentTrack);

            if (this.currentLyrics && this.currentLyrics.plain) {
                const sourceLabel = this.currentLyrics.source ? ` via ${this.currentLyrics.source}` : '';
                // Update now playing embed to enable lyrics button
                const embedManager = global.clients?.musicEmbedManager;
                if (embedManager && this.nowPlayingMessage) {
                    try {
                        await embedManager.updateNowPlayingEmbed(this);
                    } catch (error) {
                        // Ignore update errors
                    }
                }
            }
        } catch (error) {
            console.error('❌ Failed to fetch lyrics:', error.message);
            this.currentLyrics = null;
        }
    }

    hasLyrics() {
        return Boolean(this.currentLyrics && this.currentLyrics.plain);
    }

    // ==================== END LYRICS SYSTEM ====================

    scheduleStatePersist(reason = 'update', delay = 200) {
        this.cancelStateSave();
        this.stateSaveTimeout = setTimeout(() => {
            this.stateSaveTimeout = null;
            this.persistState(reason).catch(() => {});
        }, Math.max(delay, 0));
    }

    formatDuration(seconds) {
        // Ensure seconds is integer and handle floating point errors
        const totalSeconds = Math.floor(Number(seconds) || 0);
        const minutes = Math.floor(totalSeconds / 60);
        const remainingSeconds = totalSeconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    cleanup(isShutdown = false) {
        try {
            this.clearInactivityTimer(false);
            this.stopStateSync();

            // During shutdown, save state before cleanup
            if (isShutdown && this.guild?.id) {
                this.persistState('shutdown').catch(() => {});
            } else if (this.guild?.id) {
                PlayerStateManager.removeState(this.guild.id).catch(() => {});
            }

            // Clean up all downloaded files (unless shutdown)
            if (!isShutdown) {
                if (this.currentDownloadedFile) {
                    this.deleteDownloadedFile(this.currentDownloadedFile);
                    this.currentDownloadedFile = null;
                }

                for (const filepath of this.downloadedFiles) {
                    this.deleteDownloadedFile(filepath);
                }
                this.downloadedFiles.clear();
            }

            // Stop recovery system
            this.stopConnectionRecovery();

            // Clear health check timer
            if (this.connectionHealthCheck) {
                clearInterval(this.connectionHealthCheck);
                this.connectionHealthCheck = null;
            }

            // Clear track timer
            if (this.trackTimer) {
                clearTimeout(this.trackTimer);
                this.trackTimer = null;
            }

            // Stop audio player
            if (this.audioPlayer) {
                this.audioPlayer.stop();
                this.audioPlayer.removeAllListeners();
            }

            // Disconnect from voice channel
            if (this.connection) {
                this.connection.removeAllListeners();
                if (this.connection.state && this.connection.state.status !== 'destroyed') {
                    try {
                        this.connection.destroy();
                    } catch (error) {
                        console.error('Error destroying connection:', error);
                    }
                }
                this.connection = null;
            }

            // Clear resources
            if (this.resource) {
                try {
                    this.resource.playStream.destroy();
                } catch (e) {
                    // Stream might already be destroyed
                }
                this.resource = null;
            }

            // Clear preloaded streams
            this.preloadedStreams.clear();
            this.preloadingQueue = [];

            // Clear player data
            this.queue = [];
            this.currentTrack = null;
            this.previousTracks = [];
            this.startTime = null;
            this.pausedTime = 0;
            this.currentTrackCache = null;
            this.activeStreamInfo = null;

            // Clear recovery data
            this.isRecovering = false;
            this.recoveryAttempts = 0;
            this.lastPlaybackPosition = 0;
            this.currentTrackStartOffsetMs = 0;

            // Clear UI references
            this.nowPlayingMessage = null;
            this.requesterId = null;
            this.voiceChannel = null;
            this.textChannel = null;

            // Reset pause state
            this.pauseReasons.clear();
            this.paused = false;
        } catch (error) {
            console.error('❌ Error during cleanup:', error);
        }
    }



    getStatus() {
        return {
            connected: !!this.connection,
            playing: this.audioPlayer?.state?.status === AudioPlayerStatus.Playing,
            paused: this.audioPlayer?.state?.status === AudioPlayerStatus.Paused,
            queue: this.queue.length,
            volume: this.volume,
            loop: this.loop,
            shuffle: this.shuffle,
            currentTrack: this.currentTrack,
            voiceChannel: this.voiceChannel?.name,
            textChannel: this.textChannel?.name,
        };
    }

    // Clean up resources when destroying the player
    destroy() {
        // Clear track timer
        if (this.trackTimer) {
            clearTimeout(this.trackTimer);
            this.currentTrackCache = null;
            this.activeStreamInfo = null;
            this.lastPlaybackPosition = 0;
        }

        // Clear preloaded streams
        if (this.preloadedStreams) {
            this.preloadedStreams.clear();
        }

        // Stop audio and disconnect
        if (this.audioPlayer) {
            this.audioPlayer.stop();
        }

        if (this.connection) {
            this.connection.destroy();
        }
    }
}

module.exports = MusicPlayer;
