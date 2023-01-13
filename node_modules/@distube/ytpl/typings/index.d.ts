declare module '@distube/ytpl' {
  namespace ytpl {
    interface options {
      /** Limits the pulled items. */
      limit?: number;
      headers?: { [key: string]: string; };
    }
    interface result {
      id: string;
      url: string;
      title: string;
      visibility: 'link only' | 'everyone';
      description: string | null;
      total_items: number;
      views: string;
      last_updated: string;
      author: null | {
        id: string;
        name: string;
        avatar: string;
        user: string | null;
        channel_url: string;
        user_url: string | null;
      };
      items: {
        id: string;
        url: string;
        url_simple: string;
        title: string;
        thumbnail: string;
        duration: string | null;
        author: null | {
          name: string;
          ref: string;
        };
      }[];
    }

    /**
     * @param link Link to validate
     * @description Returns true if able to parse out a (formally) valid playlist ID. Does no requests to the youtube webservers.
     */
    function validateID(link: string): boolean;

    /**
     * @param link YouTube URL
     * @description Returns a promise that resovles to the playlist ID from a YouTube URL. Can be called with the playlist ID directly, in which case it returns it.
     */
    function getPlaylistID(link: string): Promise<string>;
  }

  /**
   * @description Attempts to resolve the given playlist id
   * @param id Can be the id of the YT playlist or playlist link or user link (resolves uploaded playlist) or channel link (resolves uploaded playlist)
   * @param [options] Object with options. limit[Number] -> limits the pulled items, defaults to 100, set to Infinity to get the whole playlist
   * @returns Promise that resolves to playlist data;
   */
  function ytpl(id: string, options?: ytpl.options): Promise<ytpl.result>;

  export = ytpl;
}
