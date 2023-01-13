import api from "../API"
import {SoundcloudOembed, SoundcloudOembedFilter} from "../types"

export class Oembed {
    public constructor(private readonly api: api) {}

    /**
     * Gets the Oembed for a track, playlist, or user.
     */
    public get = async (params: SoundcloudOembedFilter) => {
        const response = await this.api.getWebsite(`/oembed`, params)
        return response as Promise<SoundcloudOembed>
    }
}
