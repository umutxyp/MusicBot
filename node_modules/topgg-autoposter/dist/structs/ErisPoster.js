"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErisPoster = void 0;
const BasePoster_1 = require("./BasePoster");
/**
 * Auto-Poster For Eris
 */
class ErisPoster extends BasePoster_1.BasePoster {
    /**
     * Create a new poster
     * @param token Top.gg API Token
     * @param client Your Eris Client
     * @param options Options
     */
    constructor(token, client, options) {
        if (!token)
            throw new Error('Missing Top.gg Token');
        if (!client)
            throw new Error('Missing client');
        const Discord = require('eris');
        if (!(client instanceof Discord.Client))
            throw new Error('Not an eris client.');
        super(token, options);
        this.client = client;
        this._binder({
            clientReady: () => this.clientReady(),
            waitForReady: (fn) => this.waitForReady(fn),
            getStats: () => this.getStats()
        });
    }
    clientReady() {
        return this.client.ready;
    }
    waitForReady(fn) {
        this.client.once('ready', () => {
            fn();
        });
    }
    async getStats() {
        return {
            serverCount: this.client.guilds.size,
            shardCount: this.client.options.maxShards
        };
    }
}
exports.ErisPoster = ErisPoster;
