/// <reference types="node" />
import { EventEmitter } from '@jpbberry/typed-emitter';
import { BotStats } from '@top-gg/sdk/dist/typings';
import { PosterOptions } from '../typings';
export interface BasePosterInterface {
    getStats: () => Promise<BotStats>;
    clientReady: () => boolean | Promise<boolean>;
    waitForReady: (fn: () => void) => void;
}
export declare class BasePoster extends EventEmitter<{
    posted: BotStats;
    error: Error;
}> {
    private options;
    private binds;
    private api;
    started: boolean;
    interval: NodeJS.Timeout;
    constructor(token: string, options?: PosterOptions);
    _binder(binds: BasePosterInterface): Promise<void>;
    /**
     * Start the posting
     */
    start(): void;
    /**
     * Stop the posting
     */
    stop(): void;
    private _setupInterval;
    post(): Promise<void>;
}
