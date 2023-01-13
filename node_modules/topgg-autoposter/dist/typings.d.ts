import { Api } from '@top-gg/sdk';
export interface PosterOptions {
    /**
     * Interval at which to post
     * @default 1800000
     */
    interval?: number;
    /**
     * Whether or not to post when the interval starts
     * @default true
     */
    postOnStart?: boolean;
    /**
     * Whether or not to begin posting right away. If off you need to run poster.start()
     */
    startPosting?: boolean;
    /**
     * Alternate sdk especially for testing.
     */
    sdk?: Api;
}
