import { BasePoster } from './structs/BasePoster';
import { PosterOptions } from './typings';
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
export declare function AutoPoster(token: string, client: any, options?: PosterOptions): BasePoster;
export { DJSPoster } from './structs/DJSPoster';
export { ErisPoster } from './structs/ErisPoster';
export { DJSSharderPoster } from './structs/DJSSharderPoster';
export { RosePoster } from './structs/RosePoster';
export default AutoPoster;
