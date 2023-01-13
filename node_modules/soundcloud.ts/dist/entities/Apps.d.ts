import api from "../API";
import { SoundcloudApp } from "../types";
export declare class Apps {
    private readonly api;
    constructor(api: api);
    /**
     * @deprecated
     * Gets Soundcloud apps.
     */
    get: () => Promise<SoundcloudApp[]>;
}
