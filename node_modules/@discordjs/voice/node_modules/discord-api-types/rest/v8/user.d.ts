import type { Permissions, Snowflake } from '../../globals';
import type { APIChannel, APIConnection, APIGuildMember, APIUser, GuildFeature } from '../../payloads/v8/index';
import type { AddUndefinedToPossiblyUndefinedPropertiesOfInterface } from '../../utils/internals';
/**
 * https://discord.com/developers/docs/resources/user#get-current-user
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPICurrentUserResult = APIUser;
/**
 * https://discord.com/developers/docs/resources/user#get-user
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIUserResult = APIUser;
/**
 * https://discord.com/developers/docs/resources/guild#get-current-user-guild-member
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetCurrentUserGuildMemberResult = APIGuildMember;
/**
 * https://discord.com/developers/docs/resources/user#modify-current-user
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPICurrentUserJSONBody = AddUndefinedToPossiblyUndefinedPropertiesOfInterface<{
    /**
     * User's username, if changed may cause the user's discriminator to be randomized
     */
    username?: string;
    /**
     * If passed, modifies the user's avatar
     */
    avatar?: string | null;
}>;
/**
 * https://discord.com/developers/docs/resources/user#modify-current-user
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPICurrentUserResult = APIUser;
/**
 * https://discord.com/developers/docs/resources/user#get-current-user-guilds
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface RESTGetAPICurrentUserGuildsQuery {
    /**
     * Get guilds before this guild ID
     */
    before?: Snowflake;
    /**
     * Get guilds after this guild ID
     */
    after?: Snowflake;
    /**
     * Max number of guilds to return (1-100)
     *
     * @default 100
     */
    limit?: number;
}
/**
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface RESTAPIPartialCurrentUserGuild {
    id: Snowflake;
    name: string;
    icon: string | null;
    owner: boolean;
    features: GuildFeature[];
    permissions: Permissions;
}
/**
 * https://discord.com/developers/docs/resources/user#get-current-user-guilds
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPICurrentUserGuildsResult = RESTAPIPartialCurrentUserGuild[];
/**
 * https://discord.com/developers/docs/resources/user#leave-guild
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTDeleteAPICurrentUserGuildResult = never;
/**
 * https://discord.com/developers/docs/resources/user#create-dm
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface RESTPostAPICurrentUserCreateDMChannelJSONBody {
    /**
     * The recipient to open a DM channel with
     */
    recipient_id: string;
}
/**
 * https://discord.com/developers/docs/resources/user#create-dm
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPICurrentUserCreateDMChannelResult = APIChannel;
/**
 * https://discord.com/developers/docs/resources/user#get-user-connections
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPICurrentUserConnectionsResult = APIConnection[];
//# sourceMappingURL=user.d.ts.map