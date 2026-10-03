'use strict';

// Force (re)registration of slash commands: npm run deploy
const { deployCommands } = require('../src/deploy');

deployCommands({ force: true }).catch((error) => {
    console.error('Slash command registration failed:', error.message);
    process.exit(1);
});
