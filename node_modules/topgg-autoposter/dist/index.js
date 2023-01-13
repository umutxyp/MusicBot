"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RosePoster = exports.DJSSharderPoster = exports.ErisPoster = exports.DJSPoster = exports.AutoPoster = void 0;
const DJSPoster_1 = require("./structs/DJSPoster");
const ErisPoster_1 = require("./structs/ErisPoster");
const DJSSharderPoster_1 = require("./structs/DJSSharderPoster");
const RosePoster_1 = require("./structs/RosePoster");
/**
 * Create an AutoPoster
 * @param token Top.gg Token
 * @param client Your Discord.js/Eris Client or Discord.js ShardingManager
 * @param options Options
 * @example
 * const AutoPoster = require('topgg-autoposter')
 *
 * AutoPoster('topggtoken', client) // that's it!
 */
function AutoPoster(token, client, options) {
    if (!token)
        throw new Error('Top.gg token is missing');
    if (!client)
        throw new Error('Client is missing');
    let DiscordJS;
    try {
        DiscordJS = require.cache[require.resolve('discord.js')];
    }
    catch (err) { }
    let Eris;
    try {
        Eris = require.cache[require.resolve('eris')];
    }
    catch (err) { }
    let DR;
    try {
        DR = require.cache[require.resolve('discord-rose')];
    }
    catch (err) { }
    if (DiscordJS && client instanceof DiscordJS.exports.Client)
        return new DJSPoster_1.DJSPoster(token, client, options);
    if (Eris && client instanceof Eris.exports.Client)
        return new ErisPoster_1.ErisPoster(token, client, options);
    if (DiscordJS && client instanceof DiscordJS.exports.ShardingManager)
        return new DJSSharderPoster_1.DJSSharderPoster(token, client, options);
    if (DR && client instanceof DR.exports.Master)
        return new RosePoster_1.RosePoster(token, client, options);
    throw new Error('Unsupported client');
}
exports.AutoPoster = AutoPoster;
var DJSPoster_2 = require("./structs/DJSPoster");
Object.defineProperty(exports, "DJSPoster", { enumerable: true, get: function () { return DJSPoster_2.DJSPoster; } });
var ErisPoster_2 = require("./structs/ErisPoster");
Object.defineProperty(exports, "ErisPoster", { enumerable: true, get: function () { return ErisPoster_2.ErisPoster; } });
var DJSSharderPoster_2 = require("./structs/DJSSharderPoster");
Object.defineProperty(exports, "DJSSharderPoster", { enumerable: true, get: function () { return DJSSharderPoster_2.DJSSharderPoster; } });
var RosePoster_2 = require("./structs/RosePoster");
Object.defineProperty(exports, "RosePoster", { enumerable: true, get: function () { return RosePoster_2.RosePoster; } });
exports.default = AutoPoster;
