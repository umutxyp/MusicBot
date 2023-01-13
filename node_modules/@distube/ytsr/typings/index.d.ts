declare module "@distube/ytsr" {
  namespace ytsr {
    interface Options {
      safeSearch?: boolean;
      limit?: number;
      continuation?: string;
      hl?: string;
      gl?: string;
      utcOffsetMinutes?: number;
      type?: "video" | "playlist";
      requestOptions?: { [key: string]: object } & { headers?: { [key: string]: string } };
    }

    interface Image {
      url: string | null;
      width: number;
      height: number;
    }

    interface Video {
      type: "video";
      id: string;
      name: string;
      url: string;
      thumbnail: string;
      thumbnails: Image[];
      isUpcoming: boolean;
      upcoming: number | null;
      isLive: boolean;
      badges: string[];
      views: number;
      duration: string;
      author: {
        name: string;
        channelID: string;
        url: string;
        bestAvatar: Image;
        avatars: Image[];
        ownerBadges: string[];
        verified: boolean;
      } | null;
    }

    interface Playlist {
      type: "playlist";
      id: string;
      name: string;
      url: string;
      length: number;
      owner: {
        name: string;
        channelID: string;
        url: string;
        ownerBadges: string[];
        verified: boolean;
      } | null;
      publishedAt: string | null;
    }

    interface VideoResult {
      query: string;
      items: Video[];
      results: number;
    }

    interface PlaylistResult {
      query: string;
      items: Playlist[];
      results: number;
    }
  }

  function ytsr(id: string): Promise<ytsr.VideoResult>;
  function ytsr(id: string, options: ytsr.Options & { type: "video" }): Promise<ytsr.VideoResult>;
  function ytsr(id: string, options: ytsr.Options & { type: "playlist" }): Promise<ytsr.PlaylistResult>;
  function ytsr(
    id: string,
    options: ytsr.Options & { type: "video" | "playlist" }
  ): Promise<ytsr.VideoResult | ytsr.PlaylistResult>;
  function ytsr(id: string, options: ytsr.Options): Promise<ytsr.VideoResult>;

  export = ytsr;
}
