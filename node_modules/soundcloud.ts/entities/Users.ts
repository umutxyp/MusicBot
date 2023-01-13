import axios from "axios"
import api from "../API"
import {SoundcloudComment, SoundcloudPlaylist, SoundcloudTrack, SoundcloudTrackV2, SoundcloudUser, SoundcloudUserCollection, SoundcloudUserFilter, SoundcloudUserFilterV2, SoundcloudUserSearchV2,
SoundcloudUserV2, SoundcloudWebProfile} from "../types"
import {Resolve} from "./index"

export class Users {
    private readonly resolve = new Resolve(this.api)
    constructor(private readonly api: api) {}

    /**
     * @deprecated use searchV2
     * Searches for users.
     */
    public search = async (params?: SoundcloudUserFilter) => {
        const response = await this.api.get(`/users`, params)
        return response as Promise<SoundcloudUser[]>
    }

    /**
     * Searches for users using the v2 API.
     */
    public searchV2 = async (params?: SoundcloudUserFilterV2) => {
        const response = await this.api.getV2(`search/users`, params)
        return response as Promise<SoundcloudUserSearchV2>
    }

    /**
     * @deprecated use getV2
     * Gets a user by URL or ID.
     */
    public get = async (userResolvable: string | number) => {
        const userID = await this.resolve.get(userResolvable, true)
        if (userID.hasOwnProperty("id")) return userID
        const response = await this.api.get(`/users/${userID}`)
        return response as Promise<SoundcloudUser>
    }

    /**
     * Fetches a user from URL or ID using Soundcloud v2 API.
     */
    public getV2 = async (userResolvable: string | number) => {
        const userID = await this.resolve.getV2(userResolvable)
        const response = await this.api.getV2(`/users/${userID}`)
        return response as Promise<SoundcloudUserV2>
    }

    /**
     * @deprecated
     * Gets all the tracks by the user.
     */
    public tracks = async (userResolvable: string | number) => {
        const userID = await this.resolve.get(userResolvable)
        const response = await this.api.get(`/users/${userID}/tracks`)
        return response as Promise<SoundcloudTrack[]>
    }
    /**
     * Gets all the tracks by the user using Soundcloud v2 API.
     */
    public tracksV2 = async (userResolvable: string | number) => {
        const userID = await this.resolve.getV2(userResolvable)
        const response = await this.api.getV2(`/users/${userID}/tracks`)
        let nextHref = response.next_href
        while (nextHref) {
            const nextPage = await this.api.getURL(nextHref)
            response.collection.push(...nextPage.collection)
            nextHref = nextPage.next_href
        }
        return response.collection as Promise<SoundcloudTrackV2[]>
    }

    /**
     * @deprecated
     * Gets all the playlists by the user.
     */
    public playlists = async (userResolvable: string | number) => {
        const userID = await this.resolve.get(userResolvable)
        const response = await this.api.get(`/users/${userID}/playlists`)
        return response as Promise<SoundcloudPlaylist[]>
    }

    /**
     * @deprecated
     * Gets all the users the user is following.
     */
    public followings = async (userResolvable: string | number) => {
        const userID = await this.resolve.get(userResolvable)
        const response = await this.api.get(`/users/${userID}/followings`)
        return response as Promise<SoundcloudUserCollection>
    }

    /**
     * @deprecated
     * Gets a specific following.
     */
    public following = async (userResolvable: string | number, anotherUserResolvable: string | number) => {
        const userID = await this.resolve.get(userResolvable)
        const followingID = await this.resolve.get(anotherUserResolvable)
        const response = await this.api.get(`/users/${userID}/followings/${followingID}`)
        return response as Promise<SoundcloudUser>
    }

    /**
     * @deprecated
     * Gets all of a users followers.
     */
    public followers = async (userResolvable: string | number) => {
        const userID = await this.resolve.get(userResolvable)
        const response = await this.api.get(`/users/${userID}/followers`)
        return response as Promise<SoundcloudUserCollection>
    }

    /**
     * @deprecated
     * Gets a specific follower.
     */
    public follower = async (userResolvable: string | number, anotherUserResolvable: string | number) => {
        const userID = await this.resolve.get(userResolvable)
        const followerID = await this.resolve.get(anotherUserResolvable)
        const response = await this.api.get(`/users/${userID}/followers/${followerID}`)
        return response as Promise<SoundcloudUser>
    }

    /**
     * @deprecated
     * Gets all comments by the user.
     */
    public comments = async (userResolvable: string | number) => {
        const userID = await this.resolve.get(userResolvable)
        const response = await this.api.get(`/users/${userID}/comments`)
        return response as Promise<SoundcloudComment[]>
    }

    /**
     * @deprecated
     * Gets all of a users favorite tracks.
     */
    public favorites = async (userResolvable: string | number) => {
        const userID = await this.resolve.get(userResolvable)
        const response = await this.api.get(`/users/${userID}/favorites`)
        return response as Promise<SoundcloudTrack[]>
    }

    /**
     * @deprecated
     * Gets a specific favorite track.
     */
    public favorite = async (userResolvable: string | number, trackResolvable: string | number) => {
        const userID = await this.resolve.get(userResolvable)
        const trackID = await this.resolve.get(trackResolvable)
        const response = await this.api.get(`/users/${userID}/favorites/${trackID}`)
        return response as Promise<SoundcloudTrack>
    }

    /**
     * Gets all the web profiles on a users sidebar.
     */
    public webProfiles = async (userResolvable: string | number) => {
        const userID = await this.resolve.getV2(userResolvable)
        const response = await this.api.getV2(`/users/soundcloud:users:${userID}/web-profiles`)
        return response as Promise<SoundcloudWebProfile[]>
    }

    /**
     * Searches for users (web scraping)
     */
    public searchAlt = async (query: string) => {
        const headers = {"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"}
        const html = await axios.get(`https://soundcloud.com/search/people?q=${query}`, {headers}).then((r) => r.data)
        const urls = html.match(/(?<=<li><h2><a href=")(.*?)(?=">)/gm)?.map((u: any) => `https://soundcloud.com${u}`)
        if (!urls) return []
        const scrape: any = []
        for (let i = 0; i < urls.length; i++) {
            const songHTML = await axios.get(urls[i], {headers}).then((r: any) => r.data)
            const json = JSON.parse(songHTML.match(/(\[{)(.*)(?=;)/gm)[0])
            const user = json[json.length - 1].data
            scrape.push(user)
        }
        return scrape as Promise<SoundcloudUserV2[]>
    }

    /**
     * Gets a user by URL (web scraping)
     */
    public getAlt = async (url: string) => {
        if (!url.startsWith("https://soundcloud.com/")) url = `https://soundcloud.com/${url}`
        const headers = {"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"}
        const songHTML = await axios.get(url, {headers}).then((r: any) => r.data)
        const json = JSON.parse(songHTML.match(/(\[{)(.*)(?=;)/gm)[0])
        const user = json[json.length - 1].data
        return user as Promise<SoundcloudUserV2>
    }

}
