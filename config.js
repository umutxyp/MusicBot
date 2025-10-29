// Load environment variables
require('dotenv').config();

module.exports = {
    // Discord Bot Settings
    discord: {
        token: process.env.DISCORD_TOKEN || 'YOUR_DISCORD_BOT_TOKEN_HERE',
        clientId: process.env.CLIENT_ID || 'YOUR_CLIENT_ID_HERE',
        guildId: process.env.GUILD_ID || null, // Leave null for global commands
    },

    // Spotify API Settings
    spotify: {
        clientId: process.env.SPOTIFY_CLIENT_ID || 'YOUR_SPOTIFY_CLIENT_ID',
        clientSecret: process.env.SPOTIFY_CLIENT_SECRET || 'YOUR_SPOTIFY_CLIENT_SECRET',
    },

    // Genius API Settings
    genius: {
        clientId: process.env.GENIUS_CLIENT_ID || '',
        clientSecret: process.env.GENIUS_CLIENT_SECRET || '',
    },

    // Bot Settings
    bot: {
        defaultVolume: 100,
        maxQueueSize: 100,
        maxPlaylistSize: 50,
        status: process.env.STATUS || '🎵 Beatra | /play',
        embedColor: process.env.EMBED_COLOR || '#FF6B6B',
        supportServer: process.env.SUPPORT_SERVER || 'https://discord.gg/ACJQzJuckW',
        website: process.env.WEBSITE || 'https://beatra.app',
        invite: 'https://discord.com/oauth2/authorize?client_id=' + process.env.CLIENT_ID + '&permissions=8&scope=bot%20applications.commands',
    },

    // Audio Settings
    audio: {
        quality: 'highestaudio',
        format: 'mp3',
        bitrate: 320,
        filters: {
            bassboost: 'bass=g=20',
            nightcore: 'aresample=48000,asetrate=48000*1.25',
            vaporwave: 'aresample=48000,asetrate=48000*0.8',
            _8d: 'apulsator=hz=0.09',
        }
    },

    ytdl: {
        requestOptions: {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        },
        format: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25,
        cookiesFromBrowser: process.env.COOKIES_FROM_BROWSER || null, // 'chrome', 'firefox', 'edge', 'safari'
        cookiesFile: process.env.COOKIES_FILE || null, // './cookies.txt'
    },

    // Sharding Settings (for bots in 1000+ servers)
    sharding: {
        // Set to 'auto' to let Discord.js calculate optimal shard count
        // Or set a specific number (e.g., 2, 4, 8, etc.)
        // Formula: Math.ceil(total_guilds / 1000) = recommended shards
        totalShards: process.env.TOTAL_SHARDS || 'auto',
        
        // Shard list to spawn (default: 'auto' spawns all)
        // Example: [0, 1, 2] to spawn specific shards
        shardList: process.env.SHARD_LIST || 'auto',
        
        // Sharding mode: 'process' (recommended) or 'worker'
        // 'process' = each shard runs in separate Node.js process (more stable)
        // 'worker' = each shard runs in worker thread (less memory, experimental)
        mode: process.env.SHARD_MODE || 'process',
        
        // Auto-respawn crashed shards (recommended: true)
        respawn: process.env.SHARD_RESPAWN !== 'false',
        
        // Delay between spawning each shard (milliseconds)
        // Discord recommends 5000-5500ms to avoid rate limits
        spawnDelay: parseInt(process.env.SHARD_SPAWN_DELAY) || 5500,
        
        // Timeout for shard ready event (milliseconds)
        spawnTimeout: parseInt(process.env.SHARD_SPAWN_TIMEOUT) || 30000,
    }

};
