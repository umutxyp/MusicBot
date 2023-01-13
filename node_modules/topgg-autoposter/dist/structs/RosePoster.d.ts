import { BasePoster, BasePosterInterface } from './BasePoster';
import { BotStats } from '@top-gg/sdk/dist/typings';
import { PosterOptions } from '../typings';
/**
 * Auto-Poster For Discord-Rose
 */
export declare class RosePoster extends BasePoster implements BasePosterInterface {
    private client;
    /**
     * Create a new poster
     * @param token Top.gg API Token
     * @param client Your Discord-Rose master
     * @param options Options
     */
    constructor(token: string, client: any, options?: PosterOptions);
    clientReady(): Promise<boolean>;
    waitForReady(fn: () => void): void;
    getStats(): Promise<BotStats>;
}
