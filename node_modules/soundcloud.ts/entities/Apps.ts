import api from "../API"
import {SoundcloudApp} from "../types"

export class Apps {
    public constructor(private readonly api: api) {}

    /**
     * @deprecated
     * Gets Soundcloud apps.
     */
    public get = async () => {
        const response = await this.api.get(`/apps`)
        return response as Promise<SoundcloudApp[]>
    }
}
