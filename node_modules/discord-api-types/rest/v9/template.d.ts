import type { APIGuild, APITemplate } from '../../payloads/v9/index';
import type { AddUndefinedToPossiblyUndefinedPropertiesOfInterface, StrictPartial } from '../../utils/internals';
/**
 * https://discord.com/developers/docs/resources/guild-template#get-guild-template
 */
export declare type RESTGetAPITemplateResult = APITemplate;
/**
 * https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template
 */
export declare type RESTPostAPITemplateCreateGuildJSONBody = AddUndefinedToPossiblyUndefinedPropertiesOfInterface<{
    /**
     * Name of the guild (2-100 characters)
     */
    name: string;
    /**
     * base64 1024x1024 png/jpeg image for the guild icon
     *
     * See https://discord.com/developers/docs/reference#image-data
     */
    icon?: string;
}>;
/**
 * https://discord.com/developers/docs/resources/guild-template#create-guild-from-guild-template
 */
export declare type RESTPostAPITemplateCreateGuildResult = APIGuild;
/**
 * https://discord.com/developers/docs/resources/guild-template#get-guild-templates
 */
export declare type RESTGetAPIGuildTemplatesResult = APITemplate[];
/**
 * https://discord.com/developers/docs/resources/guild-template#create-guild-template
 */
export declare type RESTPostAPIGuildTemplatesJSONBody = AddUndefinedToPossiblyUndefinedPropertiesOfInterface<{
    /**
     * Name of the template (1-100 characters)
     */
    name: string;
    /**
     * Description for the template (0-120 characters)
     */
    description?: string | null;
}>;
/**
 * https://discord.com/developers/docs/resources/guild-template#create-guild-template
 */
export declare type RESTPostAPIGuildTemplatesResult = APITemplate;
/**
 * https://discord.com/developers/docs/resources/guild-template#sync-guild-template
 */
export declare type RESTPutAPIGuildTemplateSyncResult = APITemplate;
/**
 * https://discord.com/developers/docs/resources/guild-template#modify-guild-template
 */
export declare type RESTPatchAPIGuildTemplateJSONBody = StrictPartial<RESTPostAPIGuildTemplatesJSONBody>;
/**
 * https://discord.com/developers/docs/resources/guild-template#modify-guild-template
 */
export declare type RESTPatchAPIGuildTemplateResult = APITemplate;
/**
 * https://discord.com/developers/docs/resources/guild-template#delete-guild-template
 */
export declare type RESTDeleteAPIGuildTemplateResult = APITemplate;
//# sourceMappingURL=template.d.ts.map