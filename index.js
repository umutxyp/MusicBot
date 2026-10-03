'use strict';

// Start the bot with any of: npm start, node ., node index.js, start.bat, start-shard.bat.
// 1) Node.js version and npm packages (installed automatically, no npm package needed for this step)
require('./src/setup/bootstrap').run();
// 2) Configuration, Discord token, yt-dlp, ffmpeg, then the sharding manager
require('./src/setup/launcher').main();
