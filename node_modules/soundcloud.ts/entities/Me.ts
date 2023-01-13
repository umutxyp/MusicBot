import api from "../API"
import {SoundcloudActivityCollection, SoundcloudConnection, SoundcloudUser} from "../types"
import {Users} from "./index"

export class Me {
    private readonly users = new Users(this.api)
    public constructor(private readonly api: api) {}

    /**
     * @deprecated
     * Gets your own profile, or your ID if pass in a true param.
     */
    public get = async <B extends boolean>(returnID?: B): Promise<B extends true ? number : SoundcloudUser> => {
        const response = await this.api.get(`/me`)
        if (returnID) return response.id
        return response
    }

    /**
     * @deprecated
     * Gets activities from your homepage.
     */
    public activities = async () => {
        const response = await this.api.get(`/me/activities`)
        return response as Promise<SoundcloudActivityCollection>
    }

    /**
     * @deprecated
     * Gets affiliated activities.
     */
    public activitiesAffiliated = async () => {
        const response = await this.api.get(`/me/activities/tracks/affiliated`)
        return response as Promise<SoundcloudActivityCollection>
    }

    /**
     * @deprecated
     * Gets exclusive activities.
     */
    public activitiesExclusive = async () => {
        const response = await this.api.get(`/me/activities/tracks/exclusive`)
        return response as Promise<SoundcloudActivityCollection>
    }

    /**
     * @deprecated
     * Gets your own activities only.
     */
    public activitiesOwn = async () => {
        const response = await this.api.get(`/me/activities/all/own`)
        return response as Promise<SoundcloudActivityCollection>
    }

    /**
     * @deprecated
     * Gets your app connections, id any.
     */
    public connections = async () => {
        const id = await this.get(true)
        const response = await this.api.get(`/me/connections`)
        return response as Promise<SoundcloudConnection[]>
    }

    /**
     * @deprecated
     * Gets a connection from its ID.
     */
    public connection = async (connectionID: number) => {
        const id = await this.get(true)
        const response = await this.api.get(`/me/connections/${connectionID}`)
        return response as Promise<SoundcloudConnection>
    }

    /**
     * @deprecated
     * Gets your tracks.
     */
    public tracks = async () => {
        const id = await this.get(true)
        return this.users.tracks(id)
    }

    /**
     * @deprecated
     * Gets your comments.
     */
    public comments = async () => {
        const id = await this.get(true)
        return this.users.comments(id)
    }

    /**
     * @deprecated
     * Gets your favorites.
     */
    public favorites = async () => {
        const id = await this.get(true)
        return this.users.favorites(id)
    }

    /**
     * @deprecated
     * Gets a favorite.
     */
    public favorite = async (userResolvable: string | number) => {
        const id = await this.get(true)
        return this.users.favorite(id, userResolvable)
    }

    /**
     * @deprecated
     * Gets your followers.
     */
    public followers = async () => {
        const id = await this.get(true)
        return this.users.followers(id)
    }

    /**
     * @deprecated
     * Gets a follower.
     */
    public follower = async (userResolvable: string | number) => {
        const id = await this.get(true)
        return this.users.follower(id, userResolvable)
    }

    /**
     * @deprecated
     * Gets your followings.
     */
    public followings = async () => {
        const id = await this.get(true)
        return this.users.followings(id)
    }

    /**
     * @deprecated
     * Gets a following.
     */
    public following = async (userResolvable: string | number) => {
        const id = await this.get(true)
        return this.users.following(id, userResolvable)
    }

    /**
     * @deprecated
     * Gets your playlists.
     */
    public playlists = async () => {
        const id = await this.get(true)
        return this.users.playlists(id)
    }

    /**
     * @deprecated
     * Gets your social networking profiles.
     */
    public webProfiles = async () => {
        const id = await this.get(true)
        return this.users.webProfiles(id)
    }

}
