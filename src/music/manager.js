'use strict';

const fs = require('node:fs');
const { DisTube, DisTubeError, Events: DisTubeEvents, Playlist, RepeatMode } = require('distube');
const { SpotifyPlugin } = require('@distube/spotify');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { DirectLinkPlugin } = require('@distube/direct-link');
const { RESTJSONErrorCodes } = require('discord.js');
const config = require('../config');
const i18n = require('../core/i18n');
const { YouTubePlugin, GenericPlugin } = require('./plugins');
const { SessionStore } = require('./session');
const { describeError, hostHint } = require('./errors');
const ytdlp = require('./ytdlp');
const views = require('../ui/views');
const log = require('../core/logger').createLogger('music');

const SESSION_SAVE_INTERVAL_MS = 15_000;
const PANEL_DEBOUNCE_MS = 750;

/**
 * ffmpeg: FFMPEG_PATH > ffmpeg-static (if installed) > ffmpeg on PATH.
 */
function resolveFfmpeg() {
    if (config.ffmpegPath) return config.ffmpegPath;
    try {
        const bundled = require('ffmpeg-static');
        if (bundled && fs.existsSync(bundled)) return bundled;
    } catch {
        // optional dependency not installed
    }
    return 'ffmpeg';
}

const isHttpProxy = (url) => /^https?:\/\//i.test(url || '');

const DISCORD_GONE = new Set([
    RESTJSONErrorCodes.UnknownMessage,
    RESTJSONErrorCodes.UnknownChannel,
    RESTJSONErrorCodes.MissingAccess,
    RESTJSONErrorCodes.MissingPermissions,
]);

class MusicManager {
    constructor(client) {
        this.client = client;
        this.shuttingDown = false;
        this.guilds = new Map();

        this.youtube = new YouTubePlugin();
        this.spotify = new SpotifyPlugin(config.spotify.clientId && config.spotify.clientSecret
            ? { api: { clientId: config.spotify.clientId, clientSecret: config.spotify.clientSecret } }
            : {});
        this.soundcloud = new SoundCloudPlugin();
        this.direct = new DirectLinkPlugin();
        this.generic = new GenericPlugin();

        this.distube = new DisTube(client, {
            // Order matters: the first extractor handles text searches (YouTube); the generic yt-dlp plugin must be last.
            plugins: [this.youtube, this.spotify, this.soundcloud, this.direct, this.generic],
            savePreviousSongs: true,
            emitAddSongWhenCreatingQueue: false,
            emitAddListWhenCreatingQueue: false,
            joinNewVoiceChannel: false,
            ffmpeg: { path: resolveFfmpeg() },
        });

        this.sessions = new SessionStore({
            youtube: this.youtube,
            spotify: this.spotify,
            soundcloud: this.soundcloud,
            direct: this.direct,
            generic: this.generic,
        });

        this.#bindEvents();
        this.saveTimer = setInterval(() => this.saveAllSessions(), SESSION_SAVE_INTERVAL_MS);
        this.saveTimer.unref();
    }

    // ─── Per guild runtime state ───────────────────────────────────────

    state(guildId) {
        let state = this.guilds.get(guildId);
        if (!state) {
            state = { panel: null, chain: Promise.resolve(), playLock: Promise.resolve(), debounce: null, refresh: null, leave: null, empty: null, pausedForEmpty: false };
            this.guilds.set(guildId, state);
        }
        return state;
    }

    translator(guildId) {
        return i18n.forGuild(this.client.guilds.cache.get(guildId));
    }

    getQueue(guildId) {
        return this.distube.getQueue(guildId);
    }

    /**
     * Plain snapshot of a queue for the panel view.
     */
    snapshot(queue) {
        const upcoming = queue.songs.slice(1);
        return {
            song: queue.songs[0],
            paused: queue.paused,
            currentTime: queue.currentTime,
            volume: queue.volume,
            repeatMode: queue.repeatMode,
            autoplay: queue.autoplay,
            filter: queue.filters.names[0] || null,
            upcoming,
            upcomingDuration: upcoming.reduce((sum, song) => sum + (song.duration || 0), 0),
        };
    }

    panelPayload(queue) {
        return views.playerPanel(this.translator(queue.id), this.snapshot(queue));
    }

    // ─── Errors ────────────────────────────────────────────────────────

    /**
     * Translation key for an error shown to users; logs setup instructions for the bot owner when needed.
     */
    explainError(error, since = 0) {
        const key = describeError(error, { youtube: this.youtube, since });
        const hint = hostHint(key);
        if (hint) log.warn(hint);
        return key;
    }

    // ─── Playing ───────────────────────────────────────────────────────

    /**
     * Resolve a query/URL and add it to the queue. Joining the voice channel and resolving the
     * song run in parallel, so the first song starts as early as possible.
     */
    async play({ voiceChannel, textChannel, member, query, position = 0 }) {
        const guildId = voiceChannel.guild.id;
        if (this.#remaining(guildId) <= 0) throw this.#queueFull();

        const metadata = { requesterId: member.id, guildId };
        const existing = this.getQueue(guildId);
        const joining = existing ? null : this.distube.voices.join(voiceChannel).then(() => null, (error) => error);

        let resolved;
        try {
            resolved = await this.distube.handler.resolve(query, { member, metadata });
        } catch (error) {
            if (joining && !(await joining) && !this.getQueue(guildId)) this.#scheduleLeave(guildId);
            throw error;
        }
        if (joining) {
            const joinError = await joining;
            if (joinError) throw joinError;
        }

        // Adding to the queue is serialized per guild: two /play commands at the same moment
        // must not both create a queue (DisTube registers a new queue only after joining).
        return this.#withPlayLock(guildId, async () => {
            const capacity = this.#remaining(guildId);
            if (capacity <= 0) throw this.#queueFull();
            let truncated = false;
            if (resolved instanceof Playlist && resolved.songs.length > capacity) {
                resolved.songs = resolved.songs.slice(0, capacity);
                truncated = true;
            }
            const started = !this.getQueue(guildId);

            await this.distube.play(voiceChannel, resolved, { member, textChannel, metadata, position });
            const queue = this.getQueue(guildId);
            if (queue && !queue.textChannel && textChannel) queue.textChannel = textChannel;
            const first = resolved instanceof Playlist ? resolved.songs[0] : resolved;
            return { resolved, truncated, started, position: queue ? queue.songs.indexOf(first) : 0 };
        });
    }

    #remaining(guildId) {
        return config.bot.maxQueueSize - (this.getQueue(guildId)?.songs.length || 0);
    }

    #queueFull() {
        return new DisTubeError('QUEUE_FULL', `Queue is full (${config.bot.maxQueueSize})`);
    }

    #withPlayLock(guildId, task) {
        const state = this.state(guildId);
        const run = state.playLock.then(task);
        state.playLock = run.catch(() => undefined);
        return run;
    }

    /**
     * After the queue was edited outside of DisTube events (remove, move, clear, shuffle...).
     */
    changed(queue, { refresh = true } = {}) {
        if (refresh) this.refreshPanel(queue.id);
        this.prefetchNext(queue);
        if (!this.shuttingDown) this.sessions.save(queue);
    }

    // ─── Panel lifecycle ───────────────────────────────────────────────

    /**
     * Run panel operations for a guild one after another so sends/edits never race.
     */
    #enqueue(guildId, task) {
        const state = this.state(guildId);
        state.chain = state.chain.then(task).catch((error) => log.warn(`Panel update failed in ${guildId}: ${error.message}`));
        return state.chain;
    }

    #forgetPanelOnError(state, error) {
        if (DISCORD_GONE.has(error?.code)) {
            state.panel = null;
            return true;
        }
        return false;
    }

    /**
     * Send a fresh panel for a new song. Re-uses the old panel when it is still the latest
     * message in the channel, otherwise deletes it and posts a new one at the bottom.
     */
    sendPanel(queue) {
        return this.#enqueue(queue.id, async () => {
            const state = this.state(queue.id);
            const channel = queue.textChannel;
            if (!channel || queue.stopped || !queue.songs.length) return;
            const payload = this.panelPayload(queue);

            if (state.panel && state.panel.channelId === channel.id && channel.lastMessageId === state.panel.id) {
                try {
                    await state.panel.edit(payload);
                    return;
                } catch (error) {
                    if (!this.#forgetPanelOnError(state, error)) throw error;
                }
            }
            if (state.panel) {
                const old = state.panel;
                state.panel = null;
                old.delete().catch(() => undefined);
            }
            state.panel = await channel.send(payload);
        });
    }

    /**
     * Edit the current panel (debounced) after a state change.
     */
    refreshPanel(guildId, { immediate = false } = {}) {
        const state = this.state(guildId);
        clearTimeout(state.debounce);
        const run = () => this.#enqueue(guildId, async () => {
            const queue = this.getQueue(guildId);
            if (!state.panel || !queue || queue.stopped || !queue.songs.length) return;
            try {
                await state.panel.edit(this.panelPayload(queue));
            } catch (error) {
                if (!this.#forgetPanelOnError(state, error)) throw error;
            }
        });
        if (immediate) return run();
        state.debounce = setTimeout(run, PANEL_DEBOUNCE_MS);
        state.debounce.unref?.();
        return undefined;
    }

    /**
     * Replace the panel with a final, control-less message.
     */
    endPanel(guildId, { titleKey, descriptionKey, song } = {}) {
        const state = this.state(guildId);
        clearTimeout(state.debounce);
        this.#stopRefresh(state);
        return this.#enqueue(guildId, async () => {
            if (!state.panel) return;
            const t = this.translator(guildId);
            const panel = state.panel;
            state.panel = null;
            await panel.edit(views.endedPanel(t, {
                title: t(titleKey),
                description: descriptionKey ? t(descriptionKey) : null,
                song,
            })).catch(() => undefined);
        });
    }

    /**
     * Make `message` the panel (e.g. /nowplaying reply) and delete the previous one.
     */
    replacePanel(guildId, message) {
        return this.#enqueue(guildId, async () => {
            const state = this.state(guildId);
            clearTimeout(state.debounce);
            const old = state.panel;
            state.panel = message;
            if (old && old.id !== message.id) await old.delete().catch(() => undefined);
        });
    }

    isCurrentPanel(guildId, messageId) {
        return this.state(guildId).panel?.id === messageId;
    }

    /**
     * Called after a button already updated the panel through the interaction.
     */
    adoptPanel(guildId, message) {
        const state = this.state(guildId);
        clearTimeout(state.debounce);
        if (message) state.panel = message;
    }

    #startRefresh(queue) {
        const state = this.state(queue.id);
        this.#stopRefresh(state);
        if (!config.bot.panelRefreshMs) return;
        state.refresh = setInterval(() => {
            const current = this.getQueue(queue.id);
            if (!current || current.stopped) return this.#stopRefresh(state);
            if (!current.paused) this.refreshPanel(queue.id, { immediate: true });
        }, config.bot.panelRefreshMs);
        state.refresh.unref?.();
    }

    #stopRefresh(state) {
        clearInterval(state.refresh);
        state.refresh = null;
    }

    // ─── Timers: leave when idle / alone ───────────────────────────────

    #clearLeave(state) {
        clearTimeout(state.leave);
        state.leave = null;
    }

    #scheduleLeave(guildId) {
        const state = this.state(guildId);
        this.#clearLeave(state);
        if (!config.bot.leaveOnFinishMs) return;
        state.leave = setTimeout(() => {
            state.leave = null;
            if (!this.getQueue(guildId)) this.distube.voices.leave(guildId);
        }, config.bot.leaveOnFinishMs);
        state.leave.unref?.();
    }

    /**
     * Humans (non-bot users) in the bot's voice channel. Uses voice states so it works
     * without the privileged GuildMembers intent.
     */
    listenerCount(guild, channelId = guild.members.me?.voice?.channelId) {
        if (!channelId) return 0;
        return guild.voiceStates.cache.filter((voiceState) =>
            voiceState.channelId === channelId && voiceState.id !== this.client.user.id && !voiceState.member?.user?.bot).size;
    }

    /**
     * Pause when everyone leaves, resume when someone returns, leave after LEAVE_ON_EMPTY.
     */
    async handleVoiceStateUpdate(oldState, newState) {
        const guild = newState.guild || oldState.guild;
        const queue = this.getQueue(guild.id);
        if (!queue) return;
        const state = this.state(guild.id);
        const listeners = this.listenerCount(guild);

        if (listeners === 0 && !state.empty && config.bot.leaveOnEmptyMs) {
            // Arm the timer before any await so concurrent voice updates can't start a second one.
            state.empty = setTimeout(async () => {
                state.empty = null;
                const current = this.getQueue(guild.id);
                if (!current || this.listenerCount(guild) > 0) return;
                state.pausedForEmpty = false;
                await this.endPanel(guild.id, { titleKey: 'musicmanager.playback_ended', descriptionKey: 'ui.left_empty' });
                await current.stop().catch(() => undefined);
                this.distube.voices.leave(guild.id);
            }, config.bot.leaveOnEmptyMs);
            state.empty.unref?.();
            if (!queue.paused) {
                state.pausedForEmpty = true;
                await queue.pause().catch(() => undefined);
                this.refreshPanel(guild.id);
            }
        } else if (listeners > 0 && state.empty) {
            clearTimeout(state.empty);
            state.empty = null;
            if (state.pausedForEmpty && queue.paused) {
                await queue.resume().catch(() => undefined);
                this.refreshPanel(guild.id);
            }
            state.pausedForEmpty = false;
        }
    }

    // ─── Prefetch ──────────────────────────────────────────────────────

    /**
     * Resolve the next song's stream in the background so it starts without delay.
     */
    prefetchNext(queue) {
        if (queue.repeatMode === RepeatMode.SONG) return;
        const next = queue.songs[1];
        if (!next) return;
        let task = null;
        if (next.stream.playFromSource) {
            if (!next.stream.url && typeof next.plugin?.prefetch === 'function') task = next.plugin.prefetch(next);
        } else if (!next.stream.song && typeof next.plugin?.createSearchQuery === 'function') {
            task = this.youtube.prefetchQuery(next.plugin.createSearchQuery(next), queue.id);
        }
        task?.catch((error) => log.debug(`Prefetch failed for ${next.name}: ${error.message}`));
    }

    // ─── Sessions ──────────────────────────────────────────────────────

    saveAllSessions() {
        if (this.shuttingDown) return Promise.resolve();
        return Promise.all([...this.distube.queues.collection.values()]
            .filter((queue) => !queue.stopped && queue.songs.length)
            .map((queue) => this.sessions.save(queue)));
    }

    /**
     * Restore saved queues for guilds on this shard.
     */
    async restoreSessions() {
        let restored = 0;
        for (const guildId of this.sessions.guildIds()) {
            const guild = this.client.guilds.cache.get(guildId);
            if (!guild) continue; // belongs to another shard
            const data = this.sessions.load(guildId);
            try {
                if (!data) continue;
                const voiceChannel = await guild.channels.fetch(data.voiceChannelId).catch(() => null);
                const textChannel = data.textChannelId ? await guild.channels.fetch(data.textChannelId).catch(() => null) : null;
                if (!voiceChannel?.isVoiceBased() || !voiceChannel.joinable) continue;
                if (!this.listenerCount(guild, voiceChannel.id)) continue;

                const songs = this.sessions.buildSongs(data, guild);
                if (!songs.length) continue;

                const ok = await this.#withPlayLock(guildId, async () => {
                    if (this.getQueue(guildId)) return false; // someone started music meanwhile
                    const queue = await this.distube.queues.create(voiceChannel, textChannel?.isTextBased() ? textChannel : undefined);
                    queue.addToQueue(songs);
                    queue.volume = data.volume ?? config.bot.defaultVolume;
                    queue.repeatMode = [0, 1, 2].includes(data.repeatMode) ? data.repeatMode : 0;
                    queue.autoplay = Boolean(data.autoplay);
                    for (const name of data.filters || []) {
                        if (this.distube.filters[name]) queue.filters.collection.set(name, { name, value: this.distube.filters[name] });
                    }
                    // Same mechanism Queue#seek uses: the first stream starts at this offset.
                    if (songs[0].duration && data.position > 0 && data.position < songs[0].duration - 2) queue._beginTime = data.position;
                    await queue.play();
                    return true;
                });
                if (ok) restored++;
            } catch (error) {
                log.warn(`Could not restore session for ${guild.name} (${guildId}): ${error.message}`);
            } finally {
                if (!this.getQueue(guildId)) await this.sessions.remove(guildId);
            }
        }
        if (restored) log.ok(`Restored ${restored} music session(s)`);
        return restored;
    }

    /**
     * Save every queue and disconnect cleanly (SIGINT/SIGTERM).
     */
    async shutdown() {
        await this.saveAllSessions();
        this.shuttingDown = true;
        clearInterval(this.saveTimer);
        await this.sessions.drain();
        for (const state of this.guilds.values()) {
            clearTimeout(state.debounce);
            clearTimeout(state.leave);
            clearTimeout(state.empty);
            clearInterval(state.refresh);
        }
        for (const voice of [...this.distube.voices.collection.values()]) {
            try {
                voice.leave();
            } catch {
                // already gone
            }
        }
    }

    // ─── DisTube events ────────────────────────────────────────────────

    #bindEvents() {
        const d = this.distube;

        d.on(DisTubeEvents.INIT_QUEUE, (queue) => {
            queue.volume = config.bot.defaultVolume;
            const proxy = ytdlp.proxyFor(queue.id);
            if (isHttpProxy(proxy)) queue.ffmpegArgs.input.http_proxy = proxy;
            this.#clearLeave(this.state(queue.id));
        });

        d.on(DisTubeEvents.PLAY_SONG, (queue) => {
            const state = this.state(queue.id);
            this.#clearLeave(state);
            this.sendPanel(queue);
            this.#startRefresh(queue);
            this.prefetchNext(queue);
            if (!this.shuttingDown) this.sessions.save(queue);
        });

        const onQueueChange = (queue) => this.changed(queue);
        d.on(DisTubeEvents.ADD_SONG, onQueueChange);
        d.on(DisTubeEvents.ADD_LIST, onQueueChange);

        d.on(DisTubeEvents.FINISH, (queue) => {
            this.endPanel(queue.id, { titleKey: 'musicplayer.queue_completed', descriptionKey: 'musicplayer.queue_completed_desc' });
            this.#scheduleLeave(queue.id);
        });

        d.on(DisTubeEvents.DISCONNECT, (queue) => {
            this.endPanel(queue.id, { titleKey: 'musicmanager.playback_ended' });
        });

        d.on(DisTubeEvents.DELETE_QUEUE, (queue) => {
            const state = this.state(queue.id);
            clearTimeout(state.empty);
            state.empty = null;
            state.pausedForEmpty = false;
            this.#stopRefresh(state);
            if (!this.shuttingDown) this.sessions.remove(queue.id);
        });

        d.on(DisTubeEvents.NO_RELATED, (queue) => {
            const t = this.translator(queue.id);
            queue.textChannel?.send(views.notice(t('ui.no_related'), { ephemeral: false })).catch(() => undefined);
        });

        d.on(DisTubeEvents.ERROR, (error, queue, song) => {
            log.warn(`[${queue?.id ?? '?'}] ${song ? `${song.name}: ` : ''}${error.message}`);
            if (!queue?.textChannel || this.shuttingDown) return;
            const t = this.translator(queue.id);
            const header = song ? `${t('musicplayer.track_could_not_play')} **${song.name}**\n` : '';
            const key = this.explainError(error, Date.now() - 60_000);
            queue.textChannel.send(views.notice(`${header}${t(key)}`, { ephemeral: false })).catch(() => undefined);
        });

        if (config.debug) {
            d.on(DisTubeEvents.DEBUG, (message) => log.debug(message));
            d.on(DisTubeEvents.FFMPEG_DEBUG, (message) => log.debug(message));
        }
    }
}

module.exports = { MusicManager, resolveFfmpeg };
