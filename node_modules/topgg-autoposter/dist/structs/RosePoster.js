"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RosePoster = void 0;
const BasePoster_1 = require("./BasePoster");
/**
 * Auto-Poster For Discord-Rose
 */
class RosePoster extends BasePoster_1.BasePoster {
    /**
     * Create a new poster
     * @param token Top.gg API Token
     * @param client Your Discord-Rose master
     * @param options Options
     */
    constructor(token, client, options) {
        if (!token)
            throw new Error('Missing Top.gg Token');
        if (!client)
            throw new Error('Missing client');
        const Discord = require('discord-rose');
        if (!(client instanceof Discord.Master))
            throw new Error('Not a Discord-Rose master.');
        super(token, options);
        this.client = client;
        this._binder({
            clientReady: () => this.clientReady(),
            waitForReady: (fn) => this.waitForReady(fn),
            getStats: () => this.getStats()
        });
    }
    async clientReady() {
        if (!this.client.spawned)
            return false;
        const stats = await this.client.getStats();
        return stats.every(x => x.shards.every(x => x.state === 2));
    }
    waitForReady(fn) {
        this.client.once('READY', () => {
            fn();
        });
    }
    async getStats() {
        const stats = await this.client.getStats();
        return {
            serverCount: stats.reduce((a, b) => {
                return a + b.shards.reduce((c, d) => c + d.guilds, 0);
            }, 0),
            shardCount: this.client.options.shards
        };
    }
}
exports.RosePoster = RosePoster;
