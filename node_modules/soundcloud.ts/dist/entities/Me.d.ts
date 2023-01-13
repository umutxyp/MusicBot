import api from "../API";
import { SoundcloudActivityCollection, SoundcloudConnection, SoundcloudUser } from "../types";
export declare class Me {
    private readonly api;
    private readonly users;
    constructor(api: api);
    /**
     * @deprecated
     * Gets your own profile, or your ID if pass in a true param.
     */
    get: <B extends boolean>(returnID?: B) => Promise<B extends true ? number : SoundcloudUser>;
    /**
     * @deprecated
     * Gets activities from your homepage.
     */
    activities: () => Promise<SoundcloudActivityCollection>;
    /**
     * @deprecated
     * Gets affiliated activities.
     */
    activitiesAffiliated: () => Promise<SoundcloudActivityCollection>;
    /**
     * @deprecated
     * Gets exclusive activities.
     */
    activitiesExclusive: () => Promise<SoundcloudActivityCollection>;
    /**
     * @deprecated
     * Gets your own activities only.
     */
    activitiesOwn: () => Promise<SoundcloudActivityCollection>;
    /**
     * @deprecated
     * Gets your app connections, id any.
     */
    connections: () => Promise<SoundcloudConnection[]>;
    /**
     * @deprecated
     * Gets a connection from its ID.
     */
    connection: (connectionID: number) => Promise<SoundcloudConnection>;
    /**
     * @deprecated
     * Gets your tracks.
     */
    tracks: () => Promise<import("../types").SoundcloudTrack[]>;
    /**
     * @deprecated
     * Gets your comments.
     */
    comments: () => Promise<import("../types").SoundcloudComment[]>;
    /**
     * @deprecated
     * Gets your favorites.
     */
    favorites: () => Promise<import("../types").SoundcloudTrack[]>;
    /**
     * @deprecated
     * Gets a favorite.
     */
    favorite: (userResolvable: string | number) => Promise<import("../types").SoundcloudTrack>;
    /**
     * @deprecated
     * Gets your followers.
     */
    followers: () => Promise<import("../types").SoundcloudUserCollection>;
    /**
     * @deprecated
     * Gets a follower.
     */
    follower: (userResolvable: string | number) => Promise<SoundcloudUser>;
    /**
     * @deprecated
     * Gets your followings.
     */
    followings: () => Promise<import("../types").SoundcloudUserCollection>;
    /**
     * @deprecated
     * Gets a following.
     */
    following: (userResolvable: string | number) => Promise<SoundcloudUser>;
    /**
     * @deprecated
     * Gets your playlists.
     */
    playlists: () => Promise<import("../types").SoundcloudPlaylist[]>;
    /**
     * @deprecated
     * Gets your social networking profiles.
     */
    webProfiles: () => Promise<import("../types").SoundcloudWebProfile[]>;
}
