import axios from "axios"
import api from "../API"
import {SoundcloudComment, SoundcloudSecretToken, SoundcloudTrack, SoundcloudTrackFilter, SoundcloudTrackFilterV2, SoundcloudTrackSearchV2, SoundcloudTrackV2, SoundcloudUser} from "../types"
import {Resolve} from "./index"
export class Tracks {
    private readonly resolve = new Resolve(this.api)
    public constructor(private readonly api: api) {}

    /**
     * @deprecated Use searchV2
     * Searches for tracks.
     */
    public search = async (params?: SoundcloudTrackFilter) => {
        const response = await this.api.get(`/tracks`, params)
        return response as Promise<SoundcloudTrack[]>
    }

    /**
     * Searches for tracks using the v2 API.
     */
    public searchV2 = async (params?: SoundcloudTrackFilterV2) => {
        const response = await this.api.getV2(`search/tracks`, params)
        return response as Promise<SoundcloudTrackSearchV2>
    }

    /**
     * @deprecated use getV2
     * Fetches a track by URL or ID.
     */
    public get = async (trackResolvable: string | number) => {
        const id = await this.resolve.get(trackResolvable, true)
        if (id.hasOwnProperty("id")) return id
        const response = await this.api.get(`/tracks/${id}`)
        return response as Promise<SoundcloudTrack>
    }

    /**
     * Fetches a track from URL or ID using Soundcloud v2 API.
     */
    public getV2 = async (trackResolvable: string | number) => {
        const trackID = await this.resolve.getV2(trackResolvable)
        const response = await this.api.getV2(`/tracks/${trackID}`)
        return response as Promise<SoundcloudTrackV2>
    }

    /**
     * Fetches tracks from an array of ID using Soundcloud v2 API.
     */
    public getArrayV2 = async (trackIds: number[]) => {
        if (trackIds.length === 0) return []
        // Max 50 ids per request => split into chunks of 50 ids
        const chunks: number[][] = []
        let i = 0
        while (i < trackIds.length) chunks.push(trackIds.slice(i, (i += 50)))
        const response: SoundcloudTrackV2[] = []
        const tracks = await Promise.all(chunks.map(chunk => this.api.getV2(`/tracks`, { ids: chunk.join(",") })))
        return response.concat(...tracks)
    }

    /**
     * @deprecated
     * Fetches all comments on a track.
     */
    public comments = async (trackResolvable: string | number) => {
        const trackID = await this.resolve.get(trackResolvable)
        const response = await this.api.get(`/tracks/${trackID}/comments`)
        return response as Promise<SoundcloudComment[]>
    }

    /**
     * @deprecated
     * Gets a specific comment.
     */
    public comment = async (trackResolvable: string | number, commentID: number) => {
        const trackID = await this.resolve.get(trackResolvable)
        const response = await this.api.get(`/tracks/${trackID}/comments/${commentID}`)
        return response as Promise<SoundcloudComment>
    }

    /**
     * @deprecated
     * Get all users who favorited the track.
     */
    public favoriters = async (trackResolvable: string | number) => {
        const trackID = await this.resolve.get(trackResolvable)
        const response = await this.api.get(`/tracks/${trackID}/favoriters`)
        return response as Promise<SoundcloudUser[]>
    }

    /**
     * @deprecated
     * Get a specific favoriter.
     */
    public favoriter = async (trackResolvable: string | number, userResolvable: string | number) => {
        const trackID = await this.resolve.get(trackResolvable)
        const userID = await this.resolve.get(userResolvable)
        const response = await this.api.get(`/tracks/${trackID}/favoriters/${userID}`)
        return response as Promise<SoundcloudUser>
    }

    /**
     * @deprecated
     * Requires Authentication - Gets the secret token from one of your own tracks.
     */
    public secretToken = async (trackResolvable: string | number) => {
        const trackID = await this.resolve.get(trackResolvable)
        const response = await this.api.get(`/tracks/${trackID}/secret-token`)
        .catch(() => Promise.reject("Oauth Token is required for this endpoint."))
        return response as Promise<SoundcloudSecretToken>
    }

    /**
     * Searches for tracks (web scraping)
     */
    public searchAlt = async (query: string) => {
        const headers = {"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"}
        const html = await axios.get(`https://soundcloud.com/search/sounds?q=${query}`, {headers}).then((r) => r.data)
        const urls = html.match(/(?<=<li><h2><a href=")(.*?)(?=">)/gm)?.map((u: any) => `https://soundcloud.com${u}`)
        if (!urls) return []
        const scrape: any = []
        for (let i = 0; i < urls.length; i++) {
            const songHTML = await axios.get(urls[i], {headers}).then((r: any) => r.data)
            const json = JSON.parse(songHTML.match(/(\[{)(.*)(?=;)/gm)[0])
            const track = json[json.length - 1].data
            scrape.push(track)
        }
        return scrape as Promise<SoundcloudTrackV2[]>
    }

    /**
     * Gets a track by URL (web scraping)
     */
    public getAlt = async (url: string) => {
        if (!url.startsWith("https://soundcloud.com/")) url = `https://soundcloud.com/${url}`
        const headers = {"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"}
        const songHTML = await axios.get(url, {headers}).then((r: any) => r.data)
        const json = JSON.parse(songHTML.match(/(\[{)(.*)(?=;)/gm)[0])
        const track = json[json.length - 1].data
        return track as Promise<SoundcloudTrackV2>
    }

    /**
     * Gets all related tracks of a track using the v2 API.
     */
    public relatedV2 = async (trackResolvable: string | number, limit?: number) => {
        const trackID = await this.resolve.getV2(trackResolvable)
        const response = await this.api.getV2(`/tracks/${trackID}/related`, {limit})
        return response.collection as Promise<SoundcloudTrackV2[]>
    }
}
