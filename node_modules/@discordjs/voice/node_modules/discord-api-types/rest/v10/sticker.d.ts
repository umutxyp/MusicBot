import type { APISticker, APIStickerPack } from '../../payloads/v10/index';
import type { AddUndefinedToPossiblyUndefinedPropertiesOfInterface } from '../../utils/internals';
/**
 * https://discord.com/developers/docs/resources/sticker#get-sticker
 */
export declare type RESTGetAPIStickerResult = APISticker;
/**
 * https://discord.com/developers/docs/resources/sticker#list-nitro-sticker-packs
 */
export interface RESTGetNitroStickerPacksResult {
    sticker_packs: APIStickerPack[];
}
/**
 * https://discord.com/developers/docs/resources/sticker#list-guild-stickers
 */
export declare type RESTGetAPIGuildStickersResult = APISticker[];
/**
 * https://discord.com/developers/docs/resources/sticker#get-guild-sticker
 */
export declare type RESTGetAPIGuildStickerResult = APISticker;
/**
 * https://discord.com/developers/docs/resources/sticker#create-guild-sticker
 */
export interface RESTPostAPIGuildStickerFormDataBody {
    /**
     * Name of the sticker (2-30 characters)
     */
    name: string;
    /**
     * Description of the sticker (empty or 2-100 characters)
     */
    description: string;
    /**
     * The Discord name of a unicode emoji representing the sticker's expression (2-200 characters)
     */
    tags: string;
    /**
     * The sticker file to upload, must be a PNG, APNG, or Lottie JSON file, max 500 KB
     */
    file: unknown;
}
/**
 * https://discord.com/developers/docs/resources/sticker#create-guild-sticker
 */
export declare type RESTPostAPIGuildStickerResult = APISticker;
/**
 * https://discord.com/developers/docs/resources/sticker#modify-guild-sticker
 */
export declare type RESTPatchAPIGuildStickerJSONBody = AddUndefinedToPossiblyUndefinedPropertiesOfInterface<{
    /**
     * Name of the sticker (2-30 characters)
     */
    name?: string;
    /**
     * Description of the sticker (2-100 characters)
     */
    description?: string | null;
    /**
     * The Discord name of a unicode emoji representing the sticker's expression (2-200 characters)
     */
    tags?: string;
}>;
/**
 * https://discord.com/developers/docs/resources/sticker#modify-guild-sticker
 */
export declare type RESTPatchAPIGuildStickerResult = APISticker;
/**
 * https://discord.com/developers/docs/resources/sticker#delete-guild-sticker
 */
export declare type RESTDeleteAPIGuildStickerResult = never;
//# sourceMappingURL=sticker.d.ts.map