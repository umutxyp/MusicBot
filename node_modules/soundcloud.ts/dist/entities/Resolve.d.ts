import API from "../API";
export declare class Resolve {
    private readonly api;
    constructor(api: API);
    /**
     * @deprecated
     * Gets the ID of a user/playlist/track from the Soundcloud URL.
     */
    get: (resolvable: string | number, full?: boolean) => Promise<any>;
    /**
     * Gets the ID from the html source.
     */
    getAlt: (resolvable: string | number) => Promise<string | number>;
    /**
     * Gets the ID of a user/playlist/track from the Soundcloud URL using the v2 API.
     */
    getV2: (resolvable: string | number, full?: boolean) => Promise<any>;
}
