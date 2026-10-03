'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { Collection } = require('discord.js');

/**
 * Load every command module in this folder (files starting with "_" are helpers).
 */
function loadCommands() {
    const commands = new Collection();
    for (const file of fs.readdirSync(__dirname).sort()) {
        if (!file.endsWith('.js') || file.startsWith('_') || file === 'index.js') continue;
        const command = require(path.join(__dirname, file));
        if (!command?.data || typeof command.execute !== 'function') throw new Error(`Invalid command module: ${file}`);
        if (commands.has(command.data.name)) throw new Error(`Duplicate command name: ${command.data.name}`);
        commands.set(command.data.name, command);
    }
    return commands;
}

module.exports = { loadCommands };
