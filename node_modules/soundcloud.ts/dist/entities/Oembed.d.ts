import api from "../API";
import { SoundcloudOembed, SoundcloudOembedFilter } from "../types";
export declare class Oembed {
    private readonly api;
    constructor(api: api);
    /**
     * Gets the Oembed for a track, playlist, or user.
     */
    get: (params: SoundcloudOembedFilter) => Promise<SoundcloudOembed>;
}
