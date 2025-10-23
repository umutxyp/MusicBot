# Discord Bot Sharding Guide

## What is Sharding?

Sharding is Discord's solution for scaling bots to thousands of servers. When a bot reaches **1,000 servers**, Discord **requires** sharding to distribute the workload across multiple processes.

## Why Do I Need Sharding?

- **Discord Mandate**: Bots with 1,000+ servers MUST use sharding
- **Performance**: Distributes server load across multiple processes
- **Stability**: If one shard crashes, others continue running
- **Scalability**: Easily handle 10,000+ servers

## How Sharding Works

```
Total Servers: 2,450
Optimal Shards: 3

┌─────────────┐
│  Shard 0    │ → Servers 1-1000
│  Process 1  │
└─────────────┘

┌─────────────┐
│  Shard 1    │ → Servers 1001-2000
│  Process 2  │
└─────────────┘

┌─────────────┐
│  Shard 2    │ → Servers 2001-2450
│  Process 3  │
└─────────────┘
```

Discord automatically routes events to the correct shard based on server (guild) ID.

## Quick Start

### Starting the Bot

#### Windows
```powershell
# Interactive mode
.\start.bat
# Choose option 2 for sharding

# Direct sharding start
.\start-shard.bat
# or
npm run shard
```

#### Linux/Mac
```bash
# Normal mode (< 1000 servers)
npm start

# Sharding mode (1000+ servers)
npm run shard
```

## Configuration

### Environment Variables (.env)

```dotenv
# === Required for Sharding ===
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_client_id_here

# === Sharding Configuration ===

# Total number of shards to spawn
# 'auto' = Discord.js calculates optimal count (RECOMMENDED)
# Or set a specific number: 2, 4, 8, etc.
TOTAL_SHARDS=auto

# Which shards to spawn
# 'auto' = spawn all shards (RECOMMENDED)
# Or specify array: [0,1,2] to spawn specific shards
SHARD_LIST=auto

# Sharding mode
# 'process' = each shard in separate Node.js process (RECOMMENDED for production)
# 'worker' = each shard in worker thread (experimental, less memory)
SHARD_MODE=process

# Auto-restart crashed shards
# true = automatically respawn dead shards (RECOMMENDED)
# false = manual restart required
SHARD_RESPAWN=true

# Delay between spawning shards (milliseconds)
# Discord recommends 5000-5500ms to avoid rate limits
SHARD_SPAWN_DELAY=5500

# Timeout for shard ready event (milliseconds)
# Increase if shards time out during startup
SHARD_SPAWN_TIMEOUT=30000
```

## Shard Count Calculator

| Total Servers | Recommended Shards | Formula |
|---------------|-------------------|---------|
| < 1,000 | 1 (no sharding) | N/A |
| 1,000 - 1,999 | 2 | ceil(1500 / 1000) = 2 |
| 2,000 - 2,999 | 3 | ceil(2500 / 1000) = 3 |
| 3,000 - 3,999 | 4 | ceil(3500 / 1000) = 4 |
| 5,000 - 5,999 | 5 | ceil(5500 / 1000) = 5 |
| 10,000+ | 10+ | ceil(servers / 1000) |

**Formula**: `Math.ceil(total_servers / 1000) = required_shards`

Discord.js automatically calculates this when `TOTAL_SHARDS=auto`.

## Sharding Modes Comparison

### Process Mode (Recommended)
```dotenv
SHARD_MODE=process
```

**Pros**:
- ✅ More stable (isolated memory)
- ✅ Better error isolation (one crash doesn't affect others)
- ✅ Standard Node.js debugging tools work
- ✅ Recommended by Discord.js team

**Cons**:
- ❌ Higher memory usage
- ❌ Slightly slower IPC communication

### Worker Mode (Experimental)
```dotenv
SHARD_MODE=worker
```

**Pros**:
- ✅ Lower memory footprint
- ✅ Faster IPC communication
- ✅ Shared code in memory

**Cons**:
- ❌ Experimental (less battle-tested)
- ❌ Harder to debug
- ❌ One crash can affect thread pool

## Monitoring Shards

### Console Output

```
🚀 Starting Discord Music Bot with Sharding...
📊 Sharding Mode: process
🔢 Total Shards: auto
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[SHARD MANAGER] Launching shard 0...
[SHARD 0] ✅ Shard 0 is ready!
[SHARD 0] 🎵 Music bot serving 847 servers on this shard!
[SHARD 0] 🌐 Total servers across all shards: 1523

[SHARD MANAGER] Launching shard 1...
[SHARD 1] ✅ Shard 1 is ready!
[SHARD 1] 🎵 Music bot serving 676 servers on this shard!
[SHARD 1] 🌐 Total servers across all shards: 1523

✅ Successfully spawned 2 shard(s)
```

### Shard Events

- **Ready**: Shard successfully connected to Discord
- **Disconnect**: Shard lost connection (will reconnect)
- **Reconnecting**: Shard attempting to reconnect
- **Death**: Shard process crashed (auto-respawn if enabled)
- **Error**: Shard encountered an error

## Advanced Configuration

### Running Specific Shards

Useful for distributing shards across multiple VPS servers:

**Server 1** (.env):
```dotenv
TOTAL_SHARDS=4
SHARD_LIST=[0,1]  # Run shards 0 and 1
```

**Server 2** (.env):
```dotenv
TOTAL_SHARDS=4
SHARD_LIST=[2,3]  # Run shards 2 and 3
```

### Manual Shard Count

Force a specific number of shards:

```dotenv
TOTAL_SHARDS=8  # Always use 8 shards
```

Use cases:
- Pre-scaling before reaching 1000 servers
- Maintaining consistent shard count during growth
- Meeting specific Discord partnership requirements

### Spawn Timing Adjustments

If shards time out during startup:

```dotenv
SHARD_SPAWN_DELAY=7000      # Increase delay between shards
SHARD_SPAWN_TIMEOUT=60000   # Increase ready timeout to 60 seconds
```

## Troubleshooting

### Problem: Shards Keep Crashing

**Solutions**:
1. Check memory usage (`pm2 monit` or Task Manager)
2. Increase spawn timeout:
   ```dotenv
   SHARD_SPAWN_TIMEOUT=60000
   ```
3. Reduce concurrent spawns by increasing delay:
   ```dotenv
   SHARD_SPAWN_DELAY=7000
   ```
4. Use process mode instead of worker mode

### Problem: "Cannot spawn more than X shards"

**Cause**: Discord limits shard count based on server count.

**Solutions**:
1. Use `TOTAL_SHARDS=auto` (recommended)
2. Contact Discord for shard limit increase:
   - Email: support@discord.com
   - Mention your bot ID and current server count

### Problem: Commands Not Appearing

**Cause**: Global commands take up to 1 hour to propagate across all shards.

**Solutions**:
1. Use guild-specific testing:
   ```dotenv
   GUILD_ID=your_test_server_id
   ```
2. Wait 60 minutes for global commands
3. Check all shards are ready in console logs

### Problem: Bot Shows as Offline

**Cause**: Not all shards are connected.

**Solutions**:
1. Check shard manager logs for errors
2. Ensure all shards show "✅ ready" status
3. Verify token is valid
4. Check network connectivity

### Problem: High Memory Usage

**Solutions**:
1. Use worker mode (experimental):
   ```dotenv
   SHARD_MODE=worker
   ```
2. Reduce cache settings in index.js
3. Increase spawn delay to reduce peak memory

### Problem: Shard Respawn Loop

**Cause**: Shard crashes immediately after spawn.

**Solutions**:
1. Check for errors in crash logs
2. Verify dependencies are installed:
   ```powershell
   npm install
   ```
3. Ensure FFmpeg is available
4. Check Discord token validity

## Best Practices

### 1. Always Use Auto Mode in Production
```dotenv
TOTAL_SHARDS=auto
SHARD_LIST=auto
```
Let Discord.js handle the math.

### 2. Enable Auto-Respawn
```dotenv
SHARD_RESPAWN=true
```
Keeps your bot online during temporary failures.

### 3. Use Process Mode
```dotenv
SHARD_MODE=process
```
More stable and easier to debug.

### 4. Respect Spawn Delays
```dotenv
SHARD_SPAWN_DELAY=5500
```
Discord rate-limits connections. Don't spawn too fast.

### 5. Monitor Shard Health
Watch console logs for disconnect/death events.

### 6. Use PM2 for Production
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start shard.js --name "musicbot-shards"

# Monitor
pm2 monit

# View logs
pm2 logs musicbot-shards

# Restart
pm2 restart musicbot-shards
```

### 7. Keep Sharding Consistent
Don't frequently change `TOTAL_SHARDS`. Pick a count and stick with it.

## Performance Metrics

### Expected Resource Usage (Per Shard)

| Metric | Typical Value |
|--------|--------------|
| Memory | 150-300 MB |
| CPU (idle) | < 5% |
| CPU (playing) | 10-20% |
| Startup Time | 10-30 seconds |

### Example: Bot with 2,500 servers

```
Total Shards: 3
Per Shard: ~833 servers
Memory: 3 × 250 MB = 750 MB total
CPU: 3 × 15% = 45% total (during peak)
```

## Security Considerations

1. **Never commit .env** to version control
2. **Use environment secrets** in production (Railway, Heroku, etc.)
3. **Rotate tokens** if exposed
4. **Monitor shard logs** for unauthorized access attempts
5. **Use Discord's verification levels** for bot security

## Migration Guide

### From Single-Process to Sharding

1. **Backup your database**:
   ```powershell
   Copy-Item database/languages.json database/languages.json.backup
   ```

2. **Update .env**:
   ```dotenv
   TOTAL_SHARDS=auto
   SHARD_MODE=process
   ```

3. **Start with sharding**:
   ```powershell
   npm run shard
   ```

4. **Verify all shards are ready**:
   Check console for "✅ Shard X is ready!" messages

5. **Test commands**:
   Run `/play` in a few servers to ensure functionality

### Rollback to Single-Process

If sharding causes issues:

```powershell
# Stop sharding
# Start normal mode
npm start
```

No code changes needed - the bot supports both modes!

## Support

- **Discord Server**: https://discord.gg/ACJQzJuckW
- **GitHub Issues**: https://github.com/umutxyp/musicbot/issues
- **Documentation**: See README.md

## Additional Resources

- [Discord.js Sharding Guide](https://discordjs.guide/sharding/)
- [Discord API Documentation](https://discord.com/developers/docs/topics/gateway#sharding)
- [Discord.js GitHub](https://github.com/discordjs/discord.js)
- [Bot Best Practices](https://discord.com/developers/docs/topics/rate-limits)

---

**Remember**: Sharding is required at 1,000 servers, but you can enable it earlier for testing and future-proofing!
