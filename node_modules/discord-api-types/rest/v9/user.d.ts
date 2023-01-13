import type { Permissions, Snowflake } from '../../globals';
import type { APIChannel, APIConnection, APIGuildMember, APIUser, APIApplicationRoleConnection, GuildFeature } from '../../payloads/v9/index';
import type { AddUndefinedToPossiblyUndefinedPropertiesOfInterface } from '../../utils/internals';
/**
 * https://discord.com/developers/docs/resources/user#get-current-user
 */
export declare type RESTGetAPICurrentUserResult = APIUser;
/**
 * https://discord.com/developers/docs/resources/user#get-user
 */
export declare type RESTGetAPIUserResult = APIUser;
/**
 * https://discord.com/developers/docs/resources/user#get-current-user-guild-member
 */
export declare type RESTGetCurrentUserGuildMemberResult = APIGuildMember;
/**
 * https://discord.com/developers/docs/resources/user#modify-current-user
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
 */
export declare type RESTPatchAPICurrentUserResult = APIUser;
/**
 * https://discord.com/developers/docs/resources/user#get-current-user-guilds
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
     * Max number of guilds to return (1-200)
     *
     * @default 200
     */
    limit?: number;
}
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
 */
export declare type RESTGetAPICurrentUserGuildsResult = RESTAPIPartialCurrentUserGuild[];
/**
 * https://discord.com/developers/docs/resources/user#leave-guild
 */
export declare type RESTDeleteAPICurrentUserGuildResult = never;
/**
 * https://discord.com/developers/docs/resources/user#create-dm
 */
export interface RESTPostAPICurrentUserCreateDMChannelJSONBody {
    /**
     * The recipient to open a DM channel with
     */
    recipient_id: string;
}
/**
 * https://discord.com/developers/docs/resources/user#create-dm
 */
export declare type RESTPostAPICurrentUserCreateDMChannelResult = APIChannel;
/**
 * https://discord.com/developers/docs/resources/user#get-user-connections
 */
export declare type RESTGetAPICurrentUserConnectionsResult = APIConnection[];
/**
 * https://discord.com/developers/docs/resources/user#get-user-application-role-connection
 */
export declare type RESTGetAPICurrentUserApplicationRoleConnectionResult = APIApplicationRoleConnection;
/**
 * https://discord.com/developers/docs/resources/user#update-user-application-role-connection
 */
export interface RESTPutAPICurrentUserApplicationRoleConnectionJSONBody {
    /**
     * The vanity name of the platform a bot has connected (max 50 characters)
     */
    platform_name?: string;
    /**
     * The username on the platform a bot has connected (max 100 characters)
     */
    platform_username?: string;
    /**
     * Object mapping application role connection metadata keys to their `string`-ified value (max 100 characters) for the user on the platform a bot has connected
     */
    metadata?: Record<string, string | number>;
}
/**
 * https://discord.com/developers/docs/resources/user#update-user-application-role-connection
 */
export declare type RESTPutAPICurrentUserApplicationRoleConnectionResult = APIApplicationRoleConnection;
//# sourceMappingURL=user.d.ts.map