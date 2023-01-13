import type { Permissions, Snowflake } from '../../globals';
import type { APIChannel, APIConnection, APIGuildMember, APIUser, GuildFeature } from '../../payloads/v9/index';
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
     * Max number of guilds to return (1-100)
     *
     * @default 100
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
//# sourceMappingURL=user.d.ts.map