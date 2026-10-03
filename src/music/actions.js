'use strict';

const { RepeatMode, DisTubeError } = require('distube');
const config = require('../config');
const { formatDuration } = require('../core/format');
const views = require('../ui/views');

/**
 * Playback actions shared by slash commands and panel controls.
 * Each returns a translated message; `ok: false` means nothing changed.
 */

const result = (ok, message) => ({ ok, message });

async function togglePause(queue, t) {
    if (queue.paused) {
        await queue.resume();
        return result(true, t('buttonhandler.music_resumed'));
    }
    await queue.pause();
    return result(true, t('buttonhandler.music_paused'));
}

async function pause(queue, t) {
    if (queue.paused) return result(false, t('ui.already_paused'));
    await queue.pause();
    return result(true, t('buttonhandler.music_paused'));
}

async function resume(queue, t) {
    if (!queue.paused) return result(false, t('ui.not_paused'));
    await queue.resume();
    return result(true, t('buttonhandler.music_resumed'));
}

async function skip(queue, t) {
    if (queue.songs.length <= 1 && !queue.autoplay) return result(false, t('buttonhandler.no_songs_to_skip'));
    const current = queue.songs[0];
    await queue.skip();
    return result(true, `${t('buttonhandler.song_skipped_title')}: **${current?.name ?? ''}**`);
}

async function previous(queue, t) {
    if (!queue.previousSongs.length) return result(false, t('buttonhandler.no_previous_song'));
    await queue.previous();
    return result(true, t('buttonhandler.moved_to_previous'));
}

async function stop(queue, t, manager) {
    await manager.endPanel(queue.id, { titleKey: 'buttonhandler.music_stopped_title' });
    await queue.stop();
    manager.distube.voices.leave(queue.id);
    return result(true, t('buttonhandler.music_stopped_title'));
}

async function shuffle(queue, t) {
    if (queue.songs.length < 3) return result(false, t('buttonhandler.minimum_songs_shuffle'));
    await queue.shuffle();
    return result(true, t('buttonhandler.songs_shuffled', { count: queue.songs.length - 1 }));
}

const LOOP_MESSAGES = {
    [RepeatMode.DISABLED]: 'buttonhandler.loop_mode_off',
    [RepeatMode.SONG]: 'buttonhandler.loop_mode_track',
    [RepeatMode.QUEUE]: 'buttonhandler.loop_mode_queue',
};

function setLoop(queue, t, mode) {
    const next = mode === undefined ? (queue.repeatMode + 1) % 3 : mode;
    queue.repeatMode = next;
    return result(true, t(LOOP_MESSAGES[next]));
}

function toggleAutoplay(queue, t) {
    const enabled = queue.toggleAutoplay();
    return result(true, enabled ? t('buttons.autoplay_on') : t('buttons.autoplay_off'));
}

function setVolume(queue, t, value) {
    const volume = Number(value);
    if (!Number.isInteger(volume) || volume < 0 || volume > config.bot.maxVolume) {
        return result(false, t('modalhandler.invalid_volume'));
    }
    queue.setVolume(volume);
    return result(true, t('modalhandler.volume_changed_desc', { volume }));
}

function setFilter(queue, t, name) {
    if (!name || name === 'none') {
        if (queue.filters.size) queue.filters.clear();
        return result(true, t('ui.filter', { filter: t('ui.filter_none') }));
    }
    if (!views.FILTERS.includes(name)) return result(false, t('errors.unknown'));
    if (queue.filters.names.length !== 1 || queue.filters.names[0] !== name) queue.filters.set([name]);
    return result(true, t('ui.filter', { filter: views.FILTER_LABELS[name] }));
}

async function seek(queue, t, seconds) {
    const song = queue.songs[0];
    if (song.isLive || !song.duration) return result(false, t('ui.seek_live'));
    if (seconds === null || seconds < 0 || seconds >= song.duration) return result(false, t('ui.seek_invalid'));
    await queue.seek(seconds);
    return result(true, t('ui.seeked', { time: formatDuration(seconds) }));
}

function remove(queue, t, position) {
    if (!Number.isInteger(position) || position < 1 || position >= queue.songs.length) {
        return result(false, t('ui.invalid_position', { position }));
    }
    const [song] = queue.songs.splice(position, 1);
    return result(true, t('ui.removed', { title: song.name }));
}

function move(queue, t, from, to) {
    const last = queue.songs.length - 1;
    if (!Number.isInteger(from) || from < 1 || from > last) return result(false, t('ui.invalid_position', { position: from }));
    if (!Number.isInteger(to) || to < 1 || to > last) return result(false, t('ui.invalid_position', { position: to }));
    const [song] = queue.songs.splice(from, 1);
    queue.songs.splice(to, 0, song);
    return result(true, t('ui.moved', { title: song.name, position: to }));
}

async function jump(queue, t, position) {
    if (!Number.isInteger(position) || position < 1 || position >= queue.songs.length) {
        return result(false, t('ui.invalid_position', { position }));
    }
    const song = await queue.jump(position);
    return result(true, t('ui.jumped', { title: song.name }));
}

function clear(queue, t) {
    const count = queue.songs.length - 1;
    if (count < 1) return result(false, t('buttonhandler.no_songs_in_queue'));
    queue.songs.splice(1);
    return result(true, t('buttonhandler.songs_cleared', { count }));
}

/**
 * Turn DisTube "nothing to do" errors into friendly results instead of failures.
 */
async function safely(action, t) {
    try {
        return await action();
    } catch (error) {
        if (error instanceof DisTubeError) {
            const map = {
                PAUSED: 'ui.already_paused',
                RESUMED: 'ui.not_paused',
                NO_PREVIOUS: 'buttonhandler.no_previous_song',
                NO_UP_NEXT: 'buttonhandler.no_songs_to_skip',
                NO_RELATED: 'ui.no_related',
                NO_SONG_POSITION: 'buttonhandler.invalid_selection',
            };
            if (map[error.errorCode]) return result(false, t(map[error.errorCode]));
        }
        throw error;
    }
}

module.exports = {
    togglePause, pause, resume, skip, previous, stop, shuffle, setLoop, toggleAutoplay,
    setVolume, setFilter, seek, remove, move, jump, clear, safely,
};
