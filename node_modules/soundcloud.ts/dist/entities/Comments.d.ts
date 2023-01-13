import api from "../API";
import { SoundcloudComment } from "../types";
export declare class Comments {
    private readonly api;
    constructor(api: api);
    /**
     * Gets a comment using its ID.
     */
    get: (commentID: number) => Promise<SoundcloudComment>;
    /**
     * Gets a comment from its ID, using the Soundcloud v2 API.
     */
    getV2: (commentID: number) => Promise<SoundcloudComment>;
}
