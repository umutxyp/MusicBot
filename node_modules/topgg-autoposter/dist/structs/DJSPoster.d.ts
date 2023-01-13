import { BasePoster, BasePosterInterface } from './BasePoster';
import { BotStats } from '@top-gg/sdk/dist/typings';
import { PosterOptions } from '../typings';
/**
 * Auto-Poster For Discord.JS
 */
export declare class DJSPoster extends BasePoster implements BasePosterInterface {
    private client;
    /**
     * Create a new poster
     * @param token Top.gg API Token
     * @param client Your Discord.JS Client
     * @param options Options
     */
    constructor(token: string, client: any, options?: PosterOptions);
    clientReady(): boolean;
    waitForReady(fn: () => void): void;
    getStats(): Promise<BotStats>;
}
