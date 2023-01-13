import type { APIChannel, APIEmbed, APIFollowedChannel, APIInvite, APIMessage, APIMessageReference, APIOverwrite, APIUser, ChannelType, InviteTargetUserType, MessageFlags, OverwriteType } from '../../payloads/v6/index';
/**
 * https://discord.com/developers/docs/resources/channel#overwrite-object-overwrite-structure
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface APIOverwriteSend {
    id: string;
    type: OverwriteType;
    allow: number | string;
    deny: number | string;
}
/**
 * https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mention-types
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare enum AllowedMentionsTypes {
    Everyone = "everyone",
    Role = "roles",
    User = "users"
}
/**
 * https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mentions-structure
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface APIAllowedMentionsSend {
    parse?: AllowedMentionsTypes[];
    roles?: string[];
    users?: string[];
}
/**
 * https://discord.com/developers/docs/resources/channel#modify-channel
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPatchAPIChannelJSONBody {
    name?: string;
    type?: ChannelType.GUILD_NEWS | ChannelType.GUILD_TEXT;
    position?: number | null;
    topic?: string | null;
    nsfw?: boolean | null;
    rate_limit_per_user?: number | null;
    user_limit?: number | null;
    permission_overwrites?: APIOverwrite[] | null;
    parent_id?: string | null;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIChannelResult = APIChannel;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIChannelResult = APIChannel;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTDeleteAPIChannelResult = APIChannel;
/**
 * https://discord.com/developers/docs/resources/channel#get-channel-messages
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTGetAPIChannelMessagesQuery {
    around?: string;
    before?: string;
    after?: string;
    limit?: number;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIChannelMessagesResult = APIMessage[];
/**
 * https://discord.com/developers/docs/resources/channel#create-message
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPostAPIChannelMessageJSONBody {
    content?: string;
    nonce?: number | string;
    tts?: boolean;
    embed?: APIEmbed;
    allowed_mentions?: APIAllowedMentionsSend;
    message_reference?: APIMessageReference;
}
/**
 * https://discord.com/developers/docs/resources/channel#create-message
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIChannelMessageFormDataBody = {
    /**
     * JSON stringified message body
     */
    payload_json?: string;
    /**
     * The file contents
     */
    file: unknown;
} | {
    content?: string;
    nonce?: number | string;
    tts?: boolean;
    embed?: APIEmbed;
    allowed_mentions?: APIAllowedMentionsSend;
    message_reference?: APIMessageReference;
    /**
     * The file contents
     */
    file: unknown;
};
/**
 * https://discord.com/developers/docs/resources/channel#edit-message
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPatchAPIChannelMessageJSONBody {
    content?: string | null;
    embed?: APIEmbed | null;
    allowed_mentions?: APIAllowedMentionsSend | null;
    flags?: MessageFlags | null;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIChannelMessageResult = APIMessage;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIChannelMessageResult = APIMessage;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPatchAPIChannelMessageResult = APIMessage;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTDeleteAPIChannelMessageResult = never;
/**
 * https://discord.com/developers/docs/resources/channel#get-reactions
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTGetAPIChannelMessageReactionsQuery {
    before?: string;
    after?: string;
    limit?: number;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIChannelMessageReactionsResult = APIUser[];
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPutAPIChannelMessageReactionResult = never;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTDeleteAPIChannelMessageReactionResult = never;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTDeleteAPIChannelAllMessageReactionsResult = never;
/**
 * https://discord.com/developers/docs/resources/channel#bulk-delete-messages
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPostAPIChannelMessagesBulkDeleteJSONBody {
    messages: string[];
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIChannelMessagesBulkDeleteResult = never;
/**
 * https://discord.com/developers/docs/resources/channel#edit-channel-permissions
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPutAPIChannelPermissionsJSONBody {
    allow: number | string;
    deny: number | string;
    type: OverwriteType;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPutAPIChannelPermissionsResult = never;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTDeleteAPIChannelPermissionsResult = never;
/**
 * https://discord.com/developers/docs/resources/channel#get-channel-invites
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIChannelInvitesResult = APIInvite[];
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPostAPIChannelInviteJSONBody {
    max_age?: number;
    max_uses?: number;
    temporary?: boolean;
    unique?: boolean;
    target_user_id?: string;
    target_user_type?: InviteTargetUserType;
}
/**
 * https://discord.com/developers/docs/resources/channel#trigger-typing-indicator
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIChannelTypingResult = never;
/**
 * https://discord.com/developers/docs/resources/channel#get-pinned-messages
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTGetAPIChannelPinsResult = APIMessage[];
/**
 * https://discord.com/developers/docs/resources/channel#add-pinned-channel-message
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPutAPIChannelPinResult = never;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTDeleteAPIChannelPinResult = never;
/**
 * https://discord.com/developers/docs/resources/channel#group-dm-add-recipient
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPutAPIChannelRecipientJSONBody {
    access_token: string;
    nick?: string;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPutAPIChannelRecipientResult = unknown;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTDeleteAPIChannelRecipientResult = unknown;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIChannelMessageCrosspostResult = APIMessage;
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export interface RESTPostAPIChannelFollowersJSONBody {
    webhook_channel_id: string;
}
/**
 * @deprecated API v6 is deprecated and the types will not receive further updates, please update to v8.
 */
export declare type RESTPostAPIChannelFollowersResult = APIFollowedChannel;
//# sourceMappingURL=channel.d.ts.map