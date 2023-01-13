/// <reference types="node" />
import { EventEmitter } from "events";
import { Snowflake, BotStats, BotInfo, UserInfo, BotsResponse, ShortUser, BotsQuery } from "../typings";
interface APIOptions {
    /**
     * Top.gg Token
     */
    token?: string;
}
/**
 * Top.gg API Client for Posting stats or Fetching data
 * @example
 * ```js
 * const Topgg = require(`@top-gg/sdk`)
 *
 * const api = new Topgg.Api('Your top.gg token')
 * ```
 * @link {@link https://topgg.js.org | Library docs}
 * @link {@link https://docs.top.gg | API Reference}
 */
export declare class Api extends EventEmitter {
    private options;
    /**
     * Create Top.gg API instance
     * @param {string} token Token or options
     * @param {object?} options API Options
     */
    constructor(token: string, options?: APIOptions);
    private _request;
    /**
     * Post bot stats to Top.gg
     * @param {Object} stats Stats object
     * @param {number} stats.serverCount Server count
     * @param {number?} stats.shardCount Shard count
     * @param {number?} stats.shardId Posting shard (useful for process sharding)
     * @returns {BotStats} Passed object
     * @example
     * ```js
     * await api.postStats({
     *   serverCount: 28199,
     *   shardCount: 1
     * })
     * ```
     */
    postStats(stats: BotStats): Promise<BotStats>;
    /**
     * Get a bots stats
     * @param {Snowflake} id Bot ID
     * @returns {BotStats} Stats of bot requested
     * @example
     * ```js
     * await api.getStats('461521980492087297')
     * // =>
     * {
     *   serverCount: 28199,
     *   shardCount 1,
     *   shards: []
     * }
     * ```
     */
    getStats(id: Snowflake): Promise<BotStats>;
    /**
     * Get bot info
     * @param {Snowflake} id Bot ID
     * @returns {BotInfo} Info for bot
     * @example
     * ```js
     * await api.getBot('461521980492087297') // returns bot info
     * ```
     */
    getBot(id: Snowflake): Promise<BotInfo>;
    /**
     * Get user info
     * @param {Snowflake} id User ID
     * @returns {UserInfo} Info for user
     * @example
     * ```js
     * await api.getUser('205680187394752512')
     * // =>
     * user.username // Xignotic
     * ```
     */
    getUser(id: Snowflake): Promise<UserInfo>;
    /**
     * Get a list of bots
     * @param {BotsQuery} query Bot Query
     * @returns {BotsResponse} Return response
     * @example
     * ```js
     * // Finding by properties
     * await api.getBots({
     *   search: {
     *     username: 'shiro',
     *     certifiedBot: true
     *     ...any other bot object properties
     *   }
     * })
     * // =>
     * {
     *   results: [
     *     {
     *       id: '461521980492087297',
     *       username: 'Shiro',
     *       discriminator: '8764',
     *       lib: 'discord.js',
     *       ...rest of bot object
     *     }
     *     ...other shiro knockoffs B)
     *   ],
     *   limit: 10,
     *   offset: 0,
     *   count: 1,
     *   total: 1
     * }
     * // Restricting fields
     * await api.getBots({
     *   fields: ['id', 'username']
     * })
     * // =>
     * {
     *   results: [
     *     {
     *       id: '461521980492087297',
     *       username: 'Shiro'
     *     },
     *     {
     *       id: '493716749342998541',
     *       username: 'Mimu'
     *     },
     *     ...
     *   ],
     *   ...
     * }
     * ```
     */
    getBots(query?: BotsQuery): Promise<BotsResponse>;
    /**
     * Get users who've voted
     * @returns {ShortUser[]} Array of users who've voted
     * @example
     * ```js
     * await api.getVotes()
     * // =>
     * [
     *   {
     *     username: 'Xignotic',
     *     discriminator: '0001',
     *     id: '205680187394752512',
     *     avatar: '3b9335670c7213b3a2d4e990081900c7'
     *   },
     *   {
     *     username: 'iara',
     *     discriminator: '0001',
     *     id: '395526710101278721',
     *     avatar: '3d1477390b8d7c3cec717ac5c778f5f4'
     *   }
     *   ...more
     * ]
     * ```
     */
    getVotes(): Promise<ShortUser[]>;
    /**
     * Get whether or not a user has voted in the last 12 hours
     * @param {Snowflake} id User ID
     * @returns {Boolean} Whether the user has voted in the last 12 hours
     * @example
     * ```js
     * await api.hasVoted('205680187394752512')
     * // => true/false
     * ```
     */
    hasVoted(id: Snowflake): Promise<boolean>;
    /**
     * Whether or not the weekend multiplier is active
     * @returns {Boolean} Whether the multiplier is active
     * @example
     * ```js
     * await api.isWeekend()
     * // => true/false
     * ```
     */
    isWeekend(): Promise<boolean>;
}
export {};
