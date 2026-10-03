'use strict';

const { ActivityType, Client, Events, GatewayIntentBits } = require('discord.js');
const config = require('./config');
const logger = require('./core/logger');
const i18n = require('./core/i18n');
const { loadCommands } = require('./commands');
const { MusicManager } = require('./music/manager');
const { onInteraction } = require('./handlers/interactions');
const ytdlp = require('./music/ytdlp');

const log = logger.createLogger('bot');
logger.setDebug(config.debug);

/**
 * Create the Discord client with the music system attached. Exported for tests.
 */
function createClient() {
    const client = new Client({
        // Only the intents the bot needs: no privileged intents required.
        intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
        presence: { activities: [{ name: config.bot.status, type: ActivityType.Listening }] },
    });

    client.commands = loadCommands();
    client.commandIds = new Map();
    client.music = new MusicManager(client);

    client.on(Events.InteractionCreate, onInteraction);
    client.on(Events.VoiceStateUpdate, (oldState, newState) => {
        client.music.handleVoiceStateUpdate(oldState, newState).catch((error) => log.warn('Voice state handling failed:', error.message));
    });
    client.on(Events.Error, (error) => log.error('Client error:', error));
    client.on(Events.Warn, (message) => log.warn(message));

    client.once(Events.ClientReady, async (ready) => {
        log.ok(`Logged in as ${ready.user.tag} · ${ready.guilds.cache.size} servers on this shard`);
        try {
            const commands = await ready.application.commands.fetch(config.discord.guildId ? { guildId: config.discord.guildId } : {});
            for (const command of commands.values()) client.commandIds.set(command.name, command.id);
        } catch (error) {
            log.warn('Could not fetch command ids:', error.message);
        }
        await client.music.restoreSessions().catch((error) => log.error('Session restore failed:', error));
    });

    let stopping = null;
    client.shutdown = () => {
        stopping ??= (async () => {
            log.info('Shutting down...');
            await client.music.shutdown().catch((error) => log.error('Music shutdown failed:', error));
            await client.destroy();
            return true;
        })();
        return stopping;
    };

    return client;
}

async function start() {
    if (!config.discord.token) {
        log.error('DISCORD_TOKEN is missing. Copy .env.example to .env and fill it in.');
        process.exit(1);
    }

    i18n.migrateLegacy();
    const version = await ytdlp.version();
    if (version) log.info(`yt-dlp ${version} (${ytdlp.binary})`);
    else log.warn(`yt-dlp not found at "${ytdlp.binary}". YouTube playback will fail until it is installed (npm install, or set YTDLP_PATH).`);
    if (config.proxies.some((proxy) => !/^https?:\/\//i.test(proxy))) {
        log.warn('SOCKS proxies are used for extraction only; audio streams connect directly.');
    }

    const client = createClient();
    const managed = Boolean(process.env.SHARDING_MANAGER);

    const exit = async (code) => {
        await client.shutdown();
        process.exit(code);
    };

    if (managed) {
        // The sharding manager coordinates shutdown; ignore terminal signals here so a
        // shard is never respawned halfway through stopping. Exit if the manager dies.
        process.on('SIGINT', () => undefined);
        process.on('SIGTERM', () => undefined);
        if (process.send) process.on('disconnect', () => exit(0));
    } else {
        process.once('SIGINT', () => exit(0));
        process.once('SIGTERM', () => exit(0));
    }

    process.on('unhandledRejection', (reason) => log.error('Unhandled rejection:', reason));
    process.on('uncaughtException', (error) => {
        // State is undefined after an uncaught exception: save sessions and restart cleanly.
        log.error('Uncaught exception:', error);
        exit(1);
    });

    await client.login(config.discord.token);
    return client;
}

if (require.main === module) start();

module.exports = { createClient, start };
