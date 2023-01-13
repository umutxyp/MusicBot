import type { Permissions, Snowflake } from '../../globals';
import type { APIActionRowComponent, APIAllowedMentions, APIAttachment, APIChannel, APIEmbed, APIExtendedInvite, APIFollowedChannel, APIMessage, APIMessageActionRowComponent, APIMessageReference, APIUser, ChannelType, InviteTargetType, MessageFlags, OverwriteType, VideoQualityMode } from '../../payloads/v8/index';
import type { AddUndefinedToPossiblyUndefinedPropertiesOfInterface, StrictPartial } from '../../utils/internals';
/**
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface APIChannelPatchOverwrite extends RESTPutAPIChannelPermissionJSONBody {
    id: Snowflake;
}
/**
 * https://discord.com/developers/docs/resources/channel#get-channel
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIChannelResult = APIChannel;
/**
 * https://discord.com/developers/docs/resources/channel#modify-channel
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIChannelJSONBody = AddUndefinedToPossiblyUndefinedPropertiesOfInterface<{
    /**
     * 1-100 character channel name
     *
     * Channel types: all
     */
    name?: string;
    /**
     * The type of channel; only conversion between `text` and `news`
     * is supported and only in guilds with the "NEWS" feature
     *
     * Channel types: text, news
     */
    type?: ChannelType.GuildNews | ChannelType.GuildText;
    /**
     * The position of the channel in the left-hand listing
     *
     * Channel types: all
     */
    position?: number | null;
    /**
     * 0-1024 character channel topic
     *
     * Channel types: text, news
     */
    topic?: string | null;
    /**
     * Whether the channel is nsfw
     *
     * Channel types: text, news, store
     */
    nsfw?: boolean | null;
    /**
     * Amount of seconds a user has to wait before sending another message (0-21600);
     * bots, as well as users with the permission `MANAGE_MESSAGES` or `MANAGE_CHANNELS`,
     * are unaffected
     *
     * Channel types: text
     */
    rate_limit_per_user?: number | null;
    /**
     * The bitrate (in bits) of the voice channel; 8000 to 96000 (128000 for VIP servers)
     *
     * Channel types: voice
     */
    bitrate?: number | null;
    /**
     * The user limit of the voice channel; 0 refers to no limit, 1 to 99 refers to a user limit
     *
     * Channel types: voice
     */
    user_limit?: number | null;
    /**
     * Channel or category-specific permissions
     *
     * Channel types: all
     */
    permission_overwrites?: APIChannelPatchOverwrite[] | null;
    /**
     * ID of the new parent category for a channel
     *
     * Channel types: text, news, store, voice
     */
    parent_id?: Snowflake | null;
    /**
     * Voice region id for the voice or stage channel, automatic when set to `null`
     *
     * See https://discord.com/developers/docs/resources/voice#voice-region-object
     */
    rtc_region?: string | null;
    /**
     * The camera video quality mode of the voice channel
     *
     * See https://discord.com/developers/docs/resources/channel#channel-object-video-quality-modes
     */
    video_quality_mode?: VideoQualityMode | null;
}>;
/**
 * https://discord.com/developers/docs/resources/channel#modify-channel
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIChannelResult = APIChannel;
/**
 * https://discord.com/developers/docs/resources/channel#deleteclose-channel
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTDeleteAPIChannelResult = APIChannel;
/**
 * https://discord.com/developers/docs/resources/channel#get-channel-messages
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface RESTGetAPIChannelMessagesQuery {
    /**
     * Get messages around this message ID
     */
    around?: Snowflake;
    /**
     * Get messages before this message ID
     */
    before?: Snowflake;
    /**
     * Get messages after this message ID
     */
    after?: Snowflake;
    /**
     * Max number of messages to return (1-100)
     *
     * @default 50
     */
    limit?: number;
}
/**
 * https://discord.com/developers/docs/resources/channel#get-channel-messages
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIChannelMessagesResult = APIMessage[];
/**
 * https://discord.com/developers/docs/resources/channel#get-channel-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIChannelMessageResult = APIMessage;
/**
 * https://discord.com/developers/docs/resources/channel#message-object-message-reference-structure
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type APIMessageReferenceSend = StrictPartial<APIMessageReference> & Required<Pick<APIMessageReference, 'message_id'>> & AddUndefinedToPossiblyUndefinedPropertiesOfInterface<{
    /**
     * Whether to error if the referenced message doesn't exist instead of sending as a normal (non-reply) message
     *
     * @default true
     */
    fail_if_not_exists?: boolean;
}>;
/**
 * https://discord.com/developers/docs/resources/channel#create-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIChannelMessageJSONBody = AddUndefinedToPossiblyUndefinedPropertiesOfInterface<{
    /**
     * The message contents (up to 2000 characters)
     */
    content?: string;
    /**
     * A nonce that can be used for optimistic message sending
     */
    nonce?: number | string;
    /**
     * `true` if this is a TTS message
     */
    tts?: boolean;
    /**
     * Embedded `rich` content (up to 6000 characters)
     *
     * See https://discord.com/developers/docs/resources/channel#embed-object
     */
    embeds?: APIEmbed[];
    /**
     * Embedded `rich` content
     *
     * See https://discord.com/developers/docs/resources/channel#embed-object
     * @deprecated Use `embeds` instead
     */
    embed?: APIEmbed;
    /**
     * Allowed mentions for a message
     *
     * See https://discord.com/developers/docs/resources/channel#allowed-mentions-object
     */
    allowed_mentions?: APIAllowedMentions;
    /**
     * Include to make your message a reply
     *
     * See https://discord.com/developers/docs/resources/channel#message-object-message-reference-structure
     */
    message_reference?: APIMessageReferenceSend;
    /**
     * The components to include with the message
     *
     * See https://discord.com/developers/docs/interactions/message-components#component-object
     */
    components?: APIActionRowComponent<APIMessageActionRowComponent>[];
    /**
     * IDs of up to 3 stickers in the server to send in the message
     *
     * See https://discord.com/developers/docs/resources/sticker#sticker-object
     */
    sticker_ids?: [Snowflake] | [Snowflake, Snowflake] | [Snowflake, Snowflake, Snowflake];
    /**
     * Attachment objects with filename and description
     */
    attachments?: (Pick<APIAttachment, 'id' | 'description'> & Partial<Pick<APIAttachment, 'filename'>>)[];
    /**
     * Message flags combined as a bitfield
     */
    flags?: MessageFlags;
}>;
/**
 * https://discord.com/developers/docs/resources/channel#create-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIChannelMessageFormDataBody = ({
    /**
     * JSON stringified message body
     */
    payload_json?: string;
} & Record<`files[${bigint}]`, unknown>) | (RESTPostAPIChannelMessageJSONBody & Record<`files[${bigint}]`, unknown>);
/**
 * https://discord.com/developers/docs/resources/channel#create-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIChannelMessageResult = APIMessage;
/**
 * https://discord.com/developers/docs/resources/channel#crosspost-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIChannelMessageCrosspostResult = APIMessage;
/**
 * https://discord.com/developers/docs/resources/channel#create-reaction
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPutAPIChannelMessageReactionResult = never;
/**
 * https://discord.com/developers/docs/resources/channel#delete-own-reaction
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTDeleteAPIChannelMessageOwnReaction = never;
/**
 * https://discord.com/developers/docs/resources/channel#delete-user-reaction
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTDeleteAPIChannelMessageUserReactionResult = never;
export interface RESTGetAPIChannelMessageReactionUsersQuery {
    /**
     * Get users after this user ID
     */
    after?: Snowflake;
    /**
     * Max number of users to return (1-100)
     *
     * @default 25
     */
    limit?: number;
}
/**
 * https://discord.com/developers/docs/resources/channel#get-reactions
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIChannelMessageReactionUsersResult = APIUser[];
/**
 * https://discord.com/developers/docs/resources/channel#delete-all-reactions
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTDeleteAPIChannelAllMessageReactionsResult = never;
/**
 * https://discord.com/developers/docs/resources/channel#delete-all-reactions-for-emoji
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTDeleteAPIChannelMessageReactionResult = never;
/**
 * https://discord.com/developers/docs/resources/channel#edit-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIChannelMessageJSONBody = AddUndefinedToPossiblyUndefinedPropertiesOfInterface<{
    /**
     * The new message contents (up to 2000 characters)
     */
    content?: string | null;
    /**
     * Embedded `rich` content (up to 6000 characters)
     *
     * See https://discord.com/developers/docs/resources/channel#embed-object
     */
    embeds?: APIEmbed[] | null;
    /**
     * Embedded `rich` content
     *
     * See https://discord.com/developers/docs/resources/channel#embed-object
     * @deprecated Use `embeds` instead
     */
    embed?: APIEmbed | null;
    /**
     * Edit the flags of a message (only `SUPPRESS_EMBEDS` can currently be set/unset)
     *
     * When specifying flags, ensure to include all previously set flags/bits
     * in addition to ones that you are modifying
     *
     * See https://discord.com/developers/docs/resources/channel#message-object-message-flags
     */
    flags?: MessageFlags | null;
    /**
     * Allowed mentions for the message
     *
     * See https://discord.com/developers/docs/resources/channel#allowed-mentions-object
     */
    allowed_mentions?: APIAllowedMentions | null;
    /**
     * Attached files to keep
     *
     * Starting with API v10, the `attachments` array must contain all attachments that should be present after edit, including **retained and new** attachments provided in the request body.
     *
     * See https://discord.com/developers/docs/resources/channel#attachment-object
     */
    attachments?: (Pick<APIAttachment, 'id'> & Partial<Pick<APIAttachment, 'filename' | 'description'>>)[];
    /**
     * The components to include with the message
     *
     * See https://discord.com/developers/docs/interactions/message-components#component-object
     */
    components?: APIActionRowComponent<APIMessageActionRowComponent>[] | null;
}>;
/**
 * https://discord.com/developers/docs/resources/channel#edit-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIChannelMessageFormDataBody = ({
    /**
     * JSON stringified message body
     */
    payload_json?: string;
} & Record<`files[${bigint}]`, unknown>) | (RESTPatchAPIChannelMessageJSONBody & Record<`files[${bigint}]`, unknown>);
/**
 * https://discord.com/developers/docs/resources/channel#edit-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPatchAPIChannelMessageResult = APIMessage;
/**
 * https://discord.com/developers/docs/resources/channel#delete-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTDeleteAPIChannelMessageResult = never;
/**
 * https://discord.com/developers/docs/resources/channel#bulk-delete-messages
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface RESTPostAPIChannelMessagesBulkDeleteJSONBody {
    /**
     * An array of message ids to delete (2-100)
     */
    messages: Snowflake[];
}
/**
 * https://discord.com/developers/docs/resources/channel#bulk-delete-messages
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIChannelMessagesBulkDeleteResult = never;
/**
 * https://discord.com/developers/docs/resources/channel#edit-channel-permissions
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface RESTPutAPIChannelPermissionJSONBody {
    /**
     * The bitwise value of all allowed permissions
     *
     * See https://en.wikipedia.org/wiki/Bit_field
     *
     * @default "0"
     */
    allow?: Permissions | null;
    /**
     * The bitwise value of all disallowed permissions
     *
     * See https://en.wikipedia.org/wiki/Bit_field
     *
     * @default "0"
     */
    deny?: Permissions | null;
    /**
     * `0` for a role or `1` for a member
     */
    type: OverwriteType;
}
/**
 * https://discord.com/developers/docs/resources/channel#edit-channel-permissions
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPutAPIChannelPermissionResult = never;
/**
 * https://discord.com/developers/docs/resources/channel#get-channel-invites
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIChannelInvitesResult = APIExtendedInvite[];
/**
 * https://discord.com/developers/docs/resources/channel#create-channel-invite
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIChannelInviteJSONBody = AddUndefinedToPossiblyUndefinedPropertiesOfInterface<{
    /**
     * Duration of invite in seconds before expiry, or 0 for never
     *
     * @default 86400 (24 hours)
     */
    max_age?: number;
    /**
     * Max number of uses or 0 for unlimited
     *
     * @default 0
     */
    max_uses?: number;
    /**
     * Whether this invite only grants temporary membership
     *
     * @default false
     */
    temporary?: boolean;
    /**
     * If true, don't try to reuse a similar invite
     * (useful for creating many unique one time use invites)
     *
     * @default false
     */
    unique?: boolean;
    /**
     * The type of target for this voice channel invite
     *
     * See https://discord.com/developers/docs/resources/invite#invite-object-invite-target-types
     */
    target_type?: InviteTargetType;
    /**
     * The id of the user whose stream to display for this invite
     * - Required if `target_type` is 1
     * - The user must be streaming in the channel
     */
    target_user_id?: Snowflake;
    /**
     * The id of the embedded application to open for this invite
     * - Required if `target_type` is 2
     * - The application must have the `EMBEDDED` flag
     */
    target_application_id?: Snowflake;
}>;
/**
 * https://discord.com/developers/docs/resources/channel#create-channel-invite
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIChannelInviteResult = APIExtendedInvite;
/**
 * https://discord.com/developers/docs/resources/channel#delete-channel-permission
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTDeleteAPIChannelPermissionResult = never;
/**
 * https://discord.com/developers/docs/resources/channel#follow-news-channel
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export interface RESTPostAPIChannelFollowersJSONBody {
    /**
     * ID of target channel
     */
    webhook_channel_id: Snowflake;
}
/**
 * https://discord.com/developers/docs/resources/channel#follow-news-channel
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIChannelFollowersResult = APIFollowedChannel;
/**
 * https://discord.com/developers/docs/resources/channel#trigger-typing-indicator
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPostAPIChannelTypingResult = never;
/**
 * https://discord.com/developers/docs/resources/channel#get-pinned-messages
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTGetAPIChannelPinsResult = APIMessage[];
/**
 * https://discord.com/developers/docs/resources/channel#add-pinned-channel-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPutAPIChannelPinResult = never;
/**
 * https://discord.com/developers/docs/resources/channel#delete-pinned-channel-message
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTDeleteAPIChannelPinResult = never;
/**
 * https://discord.com/developers/docs/resources/channel#group-dm-add-recipient
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPutAPIChannelRecipientJSONBody = AddUndefinedToPossiblyUndefinedPropertiesOfInterface<{
    /**
     * Access token of a user that has granted your app the `gdm.join` scope
     */
    access_token: string;
    /**
     * Nickname of the user being added
     */
    nick?: string;
}>;
/**
 * https://discord.com/developers/docs/resources/channel#group-dm-add-recipient
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTPutAPIChannelRecipientResult = unknown;
/**
 * https://discord.com/developers/docs/resources/channel#group-dm-remove-recipient
 * @deprecated API and gateway v8 are deprecated and the types will not receive further updates, please update to v10.
 */
export declare type RESTDeleteAPIChannelRecipientResult = unknown;
//# sourceMappingURL=channel.d.ts.map