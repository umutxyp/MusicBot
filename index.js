'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { ShardingManager } = require('discord.js');
const config = require('./src/config');
const logger = require('./src/core/logger');
const { deployCommands } = require('./src/deploy');

const log = logger.createLogger('manager');
logger.setDebug(config.debug);

/**
 * v16 and older downloaded every song into audio_cache/. Nothing uses it any more, so free the disk space.
 */
function removeLegacyCache() {
    const dir = path.join(__dirname, 'audio_cache');
    if (!fs.existsSync(dir)) return;
    try {
        fs.rmSync(dir, { recursive: true, force: true });
        log.info('Removed the old audio_cache folder (no longer used).');
    } catch (error) {
        log.warn('Could not remove the old audio_cache folder:', error.message);
    }
}

/**
 * Entry point. The bot always runs under the ShardingManager: small bots get one shard,
 * large bots get as many as Discord recommends, and crashed shards restart automatically.
 */
async function main() {
    const [major, minor] = process.versions.node.split('.').map(Number);
    if (major < 22 || (major === 22 && minor < 12)) {
        log.error(`Node.js 22.12 or newer is required (current: ${process.versions.node}).`);
        process.exit(1);
    }
    if (!config.discord.token || !config.discord.clientId) {
        log.error('DISCORD_TOKEN and CLIENT_ID are required. Copy .env.example to .env and fill them in.');
        process.exit(1);
    }

    removeLegacyCache();

    try {
        await deployCommands();
    } catch (error) {
        log.error('Slash command registration failed:', error.message);
    }

    const manager = new ShardingManager(path.join(__dirname, 'src', 'bot.js'), {
        token: config.discord.token,
        totalShards: config.sharding.totalShards,
        shardList: config.sharding.shardList,
        mode: config.sharding.mode,
        respawn: config.sharding.respawn,
        execArgv: process.execArgv,
    });

    manager.on('shardCreate', (shard) => {
        log.info(`Launching shard ${shard.id}`);
        shard.on('death', (child) => log.warn(`Shard ${shard.id} exited (code ${child.exitCode ?? 'unknown'})${manager.respawn ? ', restarting' : ''}`));
        shard.on('error', (error) => log.error(`Shard ${shard.id} error:`, error));
    });

    let stopping = false;
    const stop = async () => {
        if (stopping) return;
        stopping = true;
        manager.respawn = false;
        log.info('Stopping all shards...');
        await Promise.race([
            manager.broadcastEval((client) => client.shutdown?.()).catch(() => undefined),
            new Promise((resolve) => setTimeout(resolve, 10_000)),
        ]);
        for (const shard of manager.shards.values()) shard.kill();
        process.exit(0);
    };
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);

    await manager.spawn({
        amount: config.sharding.totalShards,
        delay: config.sharding.spawnDelay,
        timeout: config.sharding.spawnTimeout,
    });
    log.ok(`${manager.shards.size} shard(s) running`);
}

main().catch((error) => {
    log.error('Failed to start:', error);
    process.exit(1);
});
