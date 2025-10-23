const { ShardingManager } = require('discord.js');
const config = require('./config');
const chalk = require('chalk');

// Create sharding manager
const manager = new ShardingManager('./index.js', {
    token: config.discord.token,
    totalShards: config.sharding?.totalShards || 'auto', // 'auto' will automatically calculate optimal shard count
    shardList: config.sharding?.shardList || 'auto',
    mode: config.sharding?.mode || 'process', // 'process' or 'worker'
    respawn: config.sharding?.respawn !== false, // Auto-respawn crashed shards
    shardArgs: process.argv.slice(2),
    execArgv: process.execArgv,
});

// Event: Shard is being created
manager.on('shardCreate', shard => {
    console.log(chalk.cyan(`[SHARD MANAGER] Launching shard ${shard.id}...`));
    
    shard.on('ready', () => {
        console.log(chalk.green(`[SHARD ${shard.id}] ✅ Shard ${shard.id} is ready!`));
    });
    
    shard.on('disconnect', () => {
        console.log(chalk.yellow(`[SHARD ${shard.id}] ⚠️ Shard ${shard.id} disconnected`));
    });
    
    shard.on('reconnecting', () => {
        console.log(chalk.blue(`[SHARD ${shard.id}] 🔄 Shard ${shard.id} reconnecting...`));
    });
    
    shard.on('death', (process) => {
        if (process.exitCode === null) {
            console.log(chalk.red(`[SHARD ${shard.id}] 💀 Shard ${shard.id} died with unknown error, restarting...`));
        } else {
            console.log(chalk.red(`[SHARD ${shard.id}] 💀 Shard ${shard.id} died with exit code ${process.exitCode}, restarting...`));
        }
    });
    
    shard.on('error', (error) => {
        console.error(chalk.red(`[SHARD ${shard.id}] ❌ Shard ${shard.id} encountered an error:`), error);
    });
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
    console.error(chalk.red('❌ Unhandled Rejection in Shard Manager:'), reason);
});

process.on('uncaughtException', (error) => {
    console.error(chalk.red('❌ Uncaught Exception in Shard Manager:'), error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log(chalk.yellow('\n⚠️  Shutting down all shards...'));
    
    try {
        await manager.broadcastEval((client) => {
            // Disconnect all voice connections
            client.players.forEach((player, guildId) => {
                player.stop();
                const { getVoiceConnection } = require('@discordjs/voice');
                const connection = getVoiceConnection(guildId);
                if (connection) connection.destroy();
            });
            
            // Destroy client
            client.destroy();
        });
        
        console.log(chalk.green('✅ All shards shut down successfully'));
        process.exit(0);
    } catch (error) {
        console.error(chalk.red('❌ Error during shutdown:'), error);
        process.exit(1);
    }
});

// Start sharding
console.log(chalk.blue('🚀 Starting Discord Music Bot with Sharding...'));
console.log(chalk.blue(`📊 Sharding Mode: ${config.sharding?.mode || 'process'}`));
console.log(chalk.blue(`🔢 Total Shards: ${config.sharding?.totalShards || 'auto'}`));
console.log(chalk.blue('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n'));

manager.spawn({
    amount: config.sharding?.totalShards || 'auto',
    delay: config.sharding?.spawnDelay || 5500, // Delay between shard spawns (Discord recommends 5-5.5 seconds)
    timeout: config.sharding?.spawnTimeout || 30000, // Timeout for shard ready
}).then(async shards => {
    console.log(chalk.green(`\n✅ Successfully spawned ${shards.size} shard(s)`));
    
    // Wait a bit for all shards to be fully ready, then restore sessions
    console.log(chalk.cyan('\n⏳ Waiting for all shards to stabilize before restoring sessions...'));
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 second wait
    
    console.log(chalk.cyan('🔄 Broadcasting session restore to all shards...'));
    
    // Broadcast restore command to all shards
    await manager.broadcastEval(async (client) => {
        // Only restore if this function exists
        if (typeof client.restoreSessions === 'function') {
            await client.restoreSessions();
        }
    }).catch(err => {
        console.error(chalk.red('❌ Error broadcasting restore:'), err.message);
    });
    
    console.log(chalk.green('✅ Session restore broadcast complete'));
    
}).catch(error => {
    console.error(chalk.red('❌ Failed to spawn shards:'), error);
    process.exit(1);
});

module.exports = manager;
