import { SoundcloudUserMini } from "./index";
export interface SoundcloudComment {
    kind: "comment";
    id: number;
    created_at: string;
    user_id: number;
    track_id: number;
    timestamp: number;
    body: string;
    uri: string;
    user: SoundcloudUserMini;
    self: {
        urn: string;
    };
}
