import {SoundcloudPlaylist} from "./index"

export interface SoundcloudActivityCollection {
    collection: SoundcloudActivity[]
    next_href: string
    future_href: string
}

export interface SoundcloudActivity {
    origin: SoundcloudPlaylist
    tags: string | null,
    created_at: string
    type: string
}

export interface SoundcloudConnection {
    created_at: string
    display_name: string
    id: number
    post_favorite: boolean
    post_publish: false,
    service: string
    type: string
    uri: string
}
