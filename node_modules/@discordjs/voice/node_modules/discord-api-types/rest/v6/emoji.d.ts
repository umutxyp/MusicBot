import type { APIEmoji } from '../../payloads/v6/index';
/**
 * https://discord.com/developers/docs/resources/emoji#list-guild-emojis
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildEmojisResult = APIEmoji[];
/**
 * https://discord.com/developers/docs/resources/emoji#get-guild-emoji
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildEmojiResult = APIEmoji;
/**
 * https://discord.com/developers/docs/resources/emoji#create-guild-emoji-json-params
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPostAPIGuildEmojiJSONBody {
    name: string;
    /**
     * The image data, read more [here](https://discord.com/developers/docs/reference#image-data)
     */
    image: string;
    roles?: string[];
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIGuildEmojiResult = APIEmoji;
/**
 * https://discord.com/developers/docs/resources/emoji#modify-guild-emoji
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPatchAPIGuildEmojiJSONBody {
    name?: string;
    roles?: string[] | null;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIGuildEmojiResult = APIEmoji;
/**
 * https://discord.com/developers/docs/resources/emoji#delete-guild-emoji
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTDeleteAPIGuildEmojiResult = never;
//# sourceMappingURL=emoji.d.ts.map