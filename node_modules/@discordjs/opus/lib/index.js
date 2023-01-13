const { find } = require('@discordjs/node-pre-gyp');
const { resolve } = require('path');

module.exports = require(find(resolve(__dirname, '..', 'package.json')));
