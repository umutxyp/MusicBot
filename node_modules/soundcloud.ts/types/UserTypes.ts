import {SoundcloudSearchV2, SoundcloudFilterV2} from "./index"
export interface SoundcloudUserFilter {
    q?: string
}

export interface SoundcloudUserMini {
    avatar_url: string
    id: number
    kind: string
    permalink_url: string
    uri: string
    username: string
    permalink: string
    last_modified: string
}

export interface SoundcloudUser {
    kind: "user"
    id: number
    permalink: string
    subscriptions: []
    username: string
    uri: string
    permalink_url: string
    avatar_url: string
    country: string
    full_name: string
    city: string
    description: string
    discogs_name: string | null
    myspace_name: string | null
    website: string | null
    website_title: string
    online: boolean
    track_count: number
    playlist_count: number
    followers_count: number
    followings_count: number
    likes_count: number
    comments_count: number
    public_favorites_count: number
    avatar_data?: string
    quota?: {
        unlimited_upload_quota: boolean
        upload_seconds_used: number
        upload_seconds_left: number
    }
    private_playlists_count?: number
    primary_email_confirmed?: boolean
    private_tracks_count?: number
    locale?: string
    last_modified: string
    first_name: string
    last_name: string
    reposts_count: number
    upload_seconds_left?: number
    plan: string
}

export interface SoundcloudUserV2 {
    avatar_url: string
    city: string
    comments_count: number
    country_code: number | null
    created_at: string
    creator_subscriptions: SoundcloudCreatorSubscription[]
    creator_subscription: SoundcloudCreatorSubscription
    description: string
    followers_count: number
    followings_count: number
    first_name: string
    full_name: string
    groups_count: number
    id: number
    kind: string
    last_modified: string
    last_name: string
    likes_count: number
    playlist_likes_count: number
    permalink: string
    permalink_url: string
    playlist_count: number
    reposts_count: number | null
    track_count: number
    uri: string
    urn: string
    username: string
    verified: boolean
    visuals: {
        urn: string
        enabled: boolean
        visuals: SoundcloudVisual[]
        tracking: null
    }
}

export interface SoundcloudUserSearchV2 extends SoundcloudSearchV2 {
    collection: SoundcloudUserV2[]
}

export interface SoundcloudWebProfile {
    network: string
    title: string
    url: string
    username: string | null
}

export interface SoundcloudUserCollection {
    collection: SoundcloudUser
    next_href: string | null
}

export interface SoundcloudVisual {
    urn: string
    entry_time: number
    visual_url: string
}

export interface SoundcloudCreatorSubscription {
    product: {
        id: string
    }
}

export interface SoundcloudUserFilterV2 extends SoundcloudFilterV2 {
    "filter.place"?: string
}
