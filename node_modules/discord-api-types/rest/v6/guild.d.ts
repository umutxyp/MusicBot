import type { RESTPutAPIChannelPermissionsJSONBody } from './channel';
import type { APIBan, APIChannel, APIGuild, APIGuildIntegration, APIGuildMember, APIGuildPreview, APIGuildWidgetSettings, APIInvite, APIRole, APIVoiceRegion, GuildDefaultMessageNotifications, GuildExplicitContentFilter, GuildFeature, GuildVerificationLevel, GuildWidgetStyle, IntegrationExpireBehavior } from '../../payloads/v6/index';
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface APIGuildCreateOverwrite extends RESTPutAPIChannelPermissionsJSONBody {
    id: number | string;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type APIGuildCreatePartialChannel = Partial<Pick<APIChannel, 'type' | 'topic' | 'nsfw' | 'bitrate' | 'user_limit' | 'rate_limit_per_user'>> & {
    name: string;
    id?: number | string;
    parent_id?: number | string;
    permission_overwrites?: APIGuildCreateOverwrite[];
};
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface APIGuildCreateRole extends RESTPostAPIGuildRoleJSONBody {
    id: number | string;
}
/**
 * https://discord.com/developers/docs/resources/guild#create-guild
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPostAPIGuildsJSONBody {
    name: string;
    region?: string;
    icon?: string;
    verification_level?: GuildVerificationLevel;
    default_message_notifications?: GuildDefaultMessageNotifications;
    explicit_content_filter?: GuildExplicitContentFilter;
    roles?: APIGuildCreateRole[];
    channels?: APIGuildCreatePartialChannel[];
    afk_channel_id?: number | string;
    afk_timeout?: number;
    system_channel_id?: number | string;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIGuildsResult = APIGuild;
/**
 * https://discord.com/developers/docs/resources/guild#get-guild
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTGetAPIGuildQuery {
    with_counts?: boolean;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildResult = APIGuild;
/**
 * https://discord.com/developers/docs/resources/guild#get-guild-preview
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildPreviewResult = APIGuildPreview;
/**
 * https://discord.com/developers/docs/resources/guild#modify-guild
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPatchAPIGuildJSONBody {
    name?: string;
    region?: string;
    verification_level?: GuildVerificationLevel;
    default_message_notifications?: GuildDefaultMessageNotifications;
    explicit_content_filter?: GuildExplicitContentFilter;
    afk_channel_id?: string | null;
    afk_timeout?: number;
    icon?: string | null;
    owner_id?: string;
    splash?: string | null;
    discovery_splash?: string | null;
    banner?: string | null;
    system_channel_id?: string | null;
    rules_channel_id?: string | null;
    public_updates_channel_id?: string | null;
    preferred_locale?: string;
    features?: GuildFeature[];
    description?: string | null;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIGuildResult = APIGuild;
/**
 * https://discord.com/developers/docs/resources/guild#delete-guild
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTDeleteAPIGuildResult = never;
/**
 * https://discord.com/developers/docs/resources/guild#get-guild-channels
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildChannelsResult = APIChannel[];
/**
 * https://discord.com/developers/docs/resources/guild#create-guild-channel
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIGuildChannelJSONBody = Partial<Pick<APIChannel, 'type' | 'permission_overwrites' | 'topic' | 'nsfw' | 'bitrate' | 'user_limit' | 'rate_limit_per_user' | 'parent_id'>> & Required<Pick<APIChannel, 'name'>>;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIGuildChannelResult = APIChannel;
/**
 * https://discord.com/developers/docs/resources/guild#modify-guild-channel-positions
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIGuildChannelPositionsJSONBody = Array<{
    id: string;
    position: number;
    lock_permissions?: boolean;
    parent_id?: string | null;
}>;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIGuildChannelPositionsResult = never;
/**
 * https://discord.com/developers/docs/resources/guild#get-guild-member
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildMemberResult = APIGuildMember;
/**
 * https://discord.com/developers/docs/resources/guild#list-guild-members
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTGetAPIGuildMembersQuery {
    limit?: number;
    after?: string;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildMembersResult = APIGuildMember[];
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTGetAPIGuildMembersSearchQuery {
    query: string;
    limit?: number;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildMembersSearchResult = APIGuildMember[];
/**
 * https://discord.com/developers/docs/resources/guild#add-guild-member
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPutAPIGuildMemberJSONBody {
    access_token: string;
    nick?: string;
    roles?: string[];
    mute?: boolean;
    deaf?: boolean;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPutAPIGuildMemberResult = APIGuildMember | undefined;
/**
 * https://discord.com/developers/docs/resources/guild#modify-guild-member
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPatchAPIGuildMemberJSONBody {
    nick?: string | null;
    roles?: string[] | null;
    mute?: boolean | null;
    deaf?: boolean | null;
    channel_id?: string | null;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIGuildMemberResult = never;
/**
 * https://discord.com/developers/docs/resources/guild#modify-current-user-nick
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPatchAPICurrentGuildMemberNicknameJSONBody {
    nick?: string | null;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPICurrentGuildMemberNicknameResult = Required<RESTPatchAPICurrentGuildMemberNicknameJSONBody>;
/**
 * https://discord.com/developers/docs/resources/guild#add-guild-member-role
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPutAPIGuildMemberRoleResult = never;
/**
 * https://discord.com/developers/docs/resources/guild#remove-guild-member-role
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTDeleteAPIGuildMemberRoleResult = never;
/**
 * https://discord.com/developers/docs/resources/guild#remove-guild-member
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTDeleteAPIGuildMemberResult = never;
/**
 * https://discord.com/developers/docs/resources/guild#get-guild-bans
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildBansResult = APIBan[];
/**
 * https://discord.com/developers/docs/resources/guild#get-guild-ban
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildBanResult = APIBan;
/**
 * https://discord.com/developers/docs/resources/guild#create-guild-ban
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPutAPIGuildBanJSONBody {
    delete_message_days?: number;
    reason?: string;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPutAPIGuildBanResult = never;
/**
 * https://discord.com/developers/docs/resources/guild#remove-guild-ban
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTDeleteAPIGuildBanResult = never;
/**
 * https://discord.com/developers/docs/resources/guild#get-guild-roles
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildRolesResult = APIRole[];
/**
 * https://discord.com/developers/docs/resources/guild#create-guild-role
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPostAPIGuildRoleJSONBody {
    name?: string | null;
    permissions?: number | string | null;
    color?: number | null;
    hoist?: boolean | null;
    mentionable?: boolean | null;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIGuildRoleResult = APIRole;
/**
 * https://discord.com/developers/docs/resources/guild#modify-guild-role-positions
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIGuildRolePositionsJSONBody = Array<{
    id: string;
    position?: number;
}>;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIGuildRolePositionsResult = APIRole[];
/**
 * https://discord.com/developers/docs/resources/guild#modify-guild-role
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPatchAPIGuildRoleJSONBody {
    name?: string;
    permissions?: number | string;
    color?: number;
    hoist?: boolean;
    mentionable?: boolean;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIGuildRoleResult = APIRole;
/**
 * https://discord.com/developers/docs/resources/guild#delete-guild-role
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTDeleteAPIGuildRoleResult = never;
/**
 * https://discord.com/developers/docs/resources/guild#get-guild-prune-count
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTGetAPIGuildPruneCountQuery {
    days?: number;
    /**
     * While this is typed as a string, it represents an array of
     * role IDs delimited by commas.
     *
     * @see https://discord.com/developers/docs/resources/guild#get-guild-prune-count-query-string-params
     */
    include_roles?: string;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTGetAPIGuildPruneCountResult {
    pruned: number;
}
/**
 * https://discord.com/developers/docs/resources/guild#begin-guild-prune
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPostAPIGuildPruneJSONBody {
    days?: number;
    compute_prune_count?: boolean;
    include_roles?: string[];
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPostAPIGuildPruneResult {
    pruned: number | null;
}
/**
 * https://discord.com/developers/docs/resources/guild#get-guild-voice-regions
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildVoiceRegionsResult = APIVoiceRegion[];
/**
 * https://discord.com/developers/docs/resources/guild#get-guild-invites
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildInvitesResult = APIInvite[];
/**
 * https://discord.com/developers/docs/resources/guild#get-guild-integrations
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTGetAPIGuildIntegrationsQuery {
    include_applications?: boolean;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildIntegrationsResult = APIGuildIntegration[];
/**
 * https://discord.com/developers/docs/resources/guild#create-guild-integration
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPostAPIGuildIntegrationJSONBody {
    type: string;
    id: string;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIGuildIntegrationResult = never;
/**
 * https://discord.com/developers/docs/resources/guild#modify-guild-integration
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPatchAPIGuildIntegrationJSONBody {
    expire_behavior?: IntegrationExpireBehavior | null;
    expire_grace_period?: number | null;
    enable_emoticons?: boolean | null;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIGuildIntegrationResult = never;
/**
 * https://discord.com/developers/docs/resources/guild#delete-guild-integration
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTDeleteAPIGuildIntegrationResult = never;
/**
 * https://discord.com/developers/docs/resources/guild#sync-guild-integration
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIGuildIntegrationSyncResult = never;
/**
 * @deprecated Renamed to RESTGetAPIGuildWidgetSettingsResult
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildWidgetResult = APIGuildWidgetSettings;
/**
 * https://discord.com/developers/docs/resources/guild#get-guild-widget-settings
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildWidgetSettingsResult = APIGuildWidgetSettings;
/**
 * @deprecated Renamed to RESTPatchAPIGuildWidgetSettingsJSONBody
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIGuildWidgetJSONBody = Partial<APIGuildWidgetSettings>;
/**
 * https://discord.com/developers/docs/resources/guild#modify-guild-widget
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIGuildWidgetSettingsJSONBody = Partial<APIGuildWidgetSettings>;
/**
 * @deprecated Use `RESTPatchAPIGuildWidgetSettingsResult` instead
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIGuildWidgetResult = APIGuildWidgetSettings;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIGuildWidgetSettingsResult = APIGuildWidgetSettings;
/**
 * https://discord.com/developers/docs/resources/guild#get-guild-vanity-url
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTGetAPIGuildVanityUrlResult {
    code: string | null;
    uses: number;
}
/**
 * https://discord.com/developers/docs/resources/guild#get-guild-widget-image
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTGetAPIGuildWidgetImageQuery {
    style?: GuildWidgetStyle;
}
/**
 * Note: while the return type is `ArrayBuffer`, the expected result is
 * a buffer of sorts (depends if in browser or on node.js/deno).
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIGuildWidgetImageResult = ArrayBuffer;
//# sourceMappingURL=guild.d.ts.map