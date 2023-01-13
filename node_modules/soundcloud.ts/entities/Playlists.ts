import axios from "axios"
import api from "../API"
import {SoundcloudPlaylist, SoundcloudPlaylistFilter, SoundcloudPlaylistSearchV2, SoundcloudPlaylistV2, SoundcloudPlaylistFilterV2, SoundcloudSecretToken} from "../types"
import {Resolve, Tracks} from "./index"

export class Playlists {
    private readonly resolve = new Resolve(this.api)
    private readonly tracks = new Tracks(this.api)
    public constructor(private readonly api: api) {}

    /**
     * Return playlist with all tracks fetched.
     */
    public fetch = async (playlist: SoundcloudPlaylistV2) => {
        const unresolvedTracks = playlist.tracks.splice(playlist.tracks.findIndex(t => !t.title)).map(t => t.id)
        if (unresolvedTracks.length === 0) return playlist
        playlist.tracks = playlist.tracks.concat(await this.tracks.getArrayV2(unresolvedTracks))
        return playlist
    }

    /**
     * @deprecated use searchV2
     * Searches for playlists.
     */
    public search = async (params?: SoundcloudPlaylistFilter) => {
        const response = await this.api.get(`/playlists`, params)
        return response as Promise<SoundcloudPlaylist[]>
    }

    /**
     * Searches for playlists using the v2 API.
     */
    public searchV2 = async (params?: SoundcloudPlaylistFilterV2) => {
        const response = await this.api.getV2(`search/playlists`, params)
        return response as Promise<SoundcloudPlaylistSearchV2>
    }

    /**
     * @deprecated use getV2
     * Fetches a playlist from URL or ID.
     */
    public get = async (playlistResolvable: string | number) => {
        const playlistID = await this.resolve.get(playlistResolvable, true)
        if (playlistID.hasOwnProperty("id")) return playlistID
        const response = await this.api.get(`/playlists/${playlistID}`)
        return response as Promise<SoundcloudPlaylist>
    }

    /**
     * Fetches a playlist from URL or ID using Soundcloud v2 API.
     */
    public getV2 = async (playlistResolvable: string | number) => {
        const playlistID = await this.resolve.getV2(playlistResolvable)
        const response = await this.api.getV2(`/playlists/${playlistID}`)
        return this.fetch(response) as Promise<SoundcloudPlaylistV2>
    }

    /**
     * @deprecated
     * Requires Authentication - Gets the secret token from one of your playlists.
     */
    public secretToken = async (playlistResolvable: string | number) => {
        const playlistID = await this.resolve.get(playlistResolvable)
        const response = await this.api.get(`/playlists/${playlistID}/secret-token`)
        .catch(() => Promise.reject("Oauth Token is required for this endpoint."))
        return response as Promise<SoundcloudSecretToken>
    }

    /**
     * Searches for playlists (web scraping)
     */
    public searchAlt = async (query: string) => {
        const headers = {"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"}
        const html = await axios.get(`https://soundcloud.com/search/sets?q=${query}`, {headers}).then((r) => r.data)
        const urls = html.match(/(?<=<li><h2><a href=")(.*?)(?=">)/gm)?.map((u: any) => `https://soundcloud.com${u}`)
        if (!urls) return []
        const scrape: any = []
        for (let i = 0; i < urls.length; i++) {
            const songHTML = await axios.get(urls[i], {headers}).then((r: any) => r.data)
            const json = JSON.parse(songHTML.match(/(\[{)(.*)(?=;)/gm)[0])
            const playlist = json[json.length - 1].data
            scrape.push(playlist)
        }
        return scrape as Promise<SoundcloudPlaylistV2[]>
    }

    /**
     * Gets a playlist by URL (web scraping)
     */
    public getAlt = async (url: string) => {
        if (!url.startsWith("https://soundcloud.com/")) url = `https://soundcloud.com/${url}`
        const headers = {"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"}
        const songHTML = await axios.get(url, {headers}).then((r: any) => r.data)
        const json = JSON.parse(songHTML.match(/(\[{)(.*)(?=;)/gm)[0])
        const playlist = json[json.length - 1].data
        return this.fetch(playlist) as Promise<SoundcloudPlaylistV2>
    }
}
