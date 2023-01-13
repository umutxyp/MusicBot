import {SoundcloudSearchV2, SoundcloudUserMini, SoundcloudUserV2, SoundcloudFilterV2} from "./index"

export type SoundcloudLicense =
    | "no-rights-reserved"
    | "all-rights-reserved"
    | "cc-by"
    | "cc-by-nc"
    | "cc-by-nd"
    | "cc-by-sa"
    | "cc-by-nc-nd"
    | "cc-by-nc-sa"

export type SoundcloudTrackType =
    | "original"
    | "remix"
    | "live"
    | "recording"
    | "spoken"
    | "podcast"
    | "demo"
    | "in progress"
    | "stem"
    | "loop"
    | "sound effect"
    | "sample"
    | "other"

export interface SoundcloudTrackFilter {
    q?: string
    tags?: string
    filter?: "public" | "private" | "all"
    license?: SoundcloudLicense
    bpm_from?: number
    bpm_to?: number
    duration_from?: number
    duration_to?: number
    created_at_from?: Date
    created_at_to?: Date
    ids?: string
    genres?: string
    types?: string
}

export interface SoundcloudTrack {
    comment_count: number
    release: number | ""
    original_content_size: number
    track_type: SoundcloudTrackType | null
    original_format: string
    streamable: boolean
    download_url: string | null
    id: number
    state: "processing" | "failed" | "finished"
    last_modified: string
    favoritings_count: number
    kind: string
    purchase_url: string
    release_year: number | null
    sharing: string
    attachments_uri: string
    license: SoundcloudLicense
    user_id: number
    user_favorite: boolean
    waveform_url: string
    permalink: string
    permalink_url: string
    playback_count: number
    downloadable: boolean
    created_at: string
    description: string
    title: string
    duration: number
    artwork_url: string
    video_url: string | null
    tag_list: string
    release_month: number | null
    genre: string
    release_day: number | null
    reposts_count: number
    label_name: string | null
    commentable: boolean
    bpm: number | null
    policy: string
    key_signature: string
    isrc: string | null
    uri: string
    download_count: number
    likes_count: number
    purchase_title: string
    embeddable_by: string
    monetization_model: string
    user: SoundcloudUserMini
    user_playback_count: number | null
    stream_url: string
    label?: SoundcloudUserMini
    label_id: number | null
    asset_data?: string
    artwork_data?: string
}

export interface SoundcloudTrackV2 {
    comment_count: number
    full_duration: number
    downloadable: boolean
    created_at: string
    description: string | null
    media: {
        transcodings: SoundcloudTranscoding[]
    }
    title: string
    publisher_metadata: {
        urn: string
        contains_music: boolean
        id: number
    }
    duration: number
    has_downloads_left: boolean
    artwork_url: string
    public: boolean
    streamable: boolean
    tag_list: string
    genre: string
    id: number
    reposts_count: number
    state: "processing" | "failed" | "finished"
    label_name: string | null
    last_modified: string
    commentable: boolean
    policy: string
    visuals: string | null
    kind: string
    purchase_url: string | null
    sharing: "private" | "public"
    uri: string
    secret_token: string | null
    download_count: number
    likes_count: number
    urn: string
    license: SoundcloudLicense
    purchase_title: string | null
    display_date: string
    embeddable_by: "all" | "me" | "none"
    release_date: string
    user_id: number
    monetization_model: string
    waveform_url: string
    permalink: string
    permalink_url: string
    user: SoundcloudUserV2
    playback_count: number
}
export interface SoundcloudTrackSearchV2 extends SoundcloudSearchV2 {
    collection: SoundcloudTrackV2[]
}

export interface SoundcloudSecretToken {
    kind: "secret-token"
    token: string
    uri: string
    resource_uri: string
}

export interface SoundcloudTranscoding {
    url: string
    preset: string
    duration: number
    snipped: boolean
    format: {
        protocol: string
        mime_type: string
    }
    quality: string
}

export interface SoundcloudTrackFilterV2 extends SoundcloudFilterV2 {
    "filter.genre_or_tag"?: string
    "filter.duration"?: "short" | "medium" | "long" | "epic"
    "filter.created_at"?: "last_hour" | "last_day" | "last_week" | "last_month" | "last_year"
    "filter.license"?: "to_modify_commercially" | "to_share" | "to_use_commercially"
}
