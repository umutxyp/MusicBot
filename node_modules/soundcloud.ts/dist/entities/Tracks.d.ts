import api from "../API";
import { SoundcloudComment, SoundcloudSecretToken, SoundcloudTrack, SoundcloudTrackFilter, SoundcloudTrackFilterV2, SoundcloudTrackSearchV2, SoundcloudTrackV2, SoundcloudUser } from "../types";
export declare class Tracks {
    private readonly api;
    private readonly resolve;
    constructor(api: api);
    /**
     * @deprecated Use searchV2
     * Searches for tracks.
     */
    search: (params?: SoundcloudTrackFilter) => Promise<SoundcloudTrack[]>;
    /**
     * Searches for tracks using the v2 API.
     */
    searchV2: (params?: SoundcloudTrackFilterV2) => Promise<SoundcloudTrackSearchV2>;
    /**
     * @deprecated use getV2
     * Fetches a track by URL or ID.
     */
    get: (trackResolvable: string | number) => Promise<any>;
    /**
     * Fetches a track from URL or ID using Soundcloud v2 API.
     */
    getV2: (trackResolvable: string | number) => Promise<SoundcloudTrackV2>;
    /**
     * Fetches tracks from an array of ID using Soundcloud v2 API.
     */
    getArrayV2: (trackIds: number[]) => Promise<SoundcloudTrackV2[]>;
    /**
     * @deprecated
     * Fetches all comments on a track.
     */
    comments: (trackResolvable: string | number) => Promise<SoundcloudComment[]>;
    /**
     * @deprecated
     * Gets a specific comment.
     */
    comment: (trackResolvable: string | number, commentID: number) => Promise<SoundcloudComment>;
    /**
     * @deprecated
     * Get all users who favorited the track.
     */
    favoriters: (trackResolvable: string | number) => Promise<SoundcloudUser[]>;
    /**
     * @deprecated
     * Get a specific favoriter.
     */
    favoriter: (trackResolvable: string | number, userResolvable: string | number) => Promise<SoundcloudUser>;
    /**
     * @deprecated
     * Requires Authentication - Gets the secret token from one of your own tracks.
     */
    secretToken: (trackResolvable: string | number) => Promise<SoundcloudSecretToken>;
    /**
     * Searches for tracks (web scraping)
     */
    searchAlt: (query: string) => Promise<SoundcloudTrackV2[]>;
    /**
     * Gets a track by URL (web scraping)
     */
    getAlt: (url: string) => Promise<SoundcloudTrackV2>;
    /**
     * Gets all related tracks of a track using the v2 API.
     */
    relatedV2: (trackResolvable: string | number, limit?: number) => Promise<SoundcloudTrackV2[]>;
}
