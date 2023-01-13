"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DJSSharderPoster = void 0;
const BasePoster_1 = require("./BasePoster");
/**
 * Auto-Poster For Discord.JS ShardingManager
 */
class DJSSharderPoster extends BasePoster_1.BasePoster {
    /**
     * Create a new poster
     * @param token Top.gg API Token
     * @param client Your Discord.JS ShardingManager
     * @param options Options
     */
    constructor(token, client, options) {
        if (!token)
            throw new Error('Missing Top.gg Token');
        if (!client)
            throw new Error('Missing client');
        const Discord = require('discord.js');
        if (!(client instanceof Discord.ShardingManager))
            throw new Error('Not a discord.js ShardingManager.');
        super(token, options);
        this.client = client;
        this._binder({
            clientReady: () => this.clientReady(),
            waitForReady: (fn) => this.waitForReady(fn),
            getStats: () => this.getStats()
        });
    }
    clientReady() {
        return this.client.shards.size > 0 && this.client.shards.every(x => x.ready);
    }
    waitForReady(fn) {
        const listener = (shard) => {
            if (shard.id !== this.client.totalShards - 1)
                return;
            this.client.off('shardCreate', listener);
            shard.once('ready', () => {
                fn();
            });
        };
        this.client.on('shardCreate', listener);
    }
    async getStats() {
        const response = await this.client.fetchClientValues('guilds.cache.size');
        return {
            serverCount: response.reduce((a, b) => a + b, 0),
            shardCount: response.length
        };
    }
}
exports.DJSSharderPoster = DJSSharderPoster;
