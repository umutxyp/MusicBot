"use strict";
/**
 * Types extracted from https://discord.com/developers/docs/resources/channel
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelFlags = exports.TextInputStyle = exports.ButtonStyle = exports.ComponentType = exports.AllowedMentionsTypes = exports.EmbedType = exports.ThreadMemberFlags = exports.ThreadAutoArchiveDuration = exports.OverwriteType = exports.MessageFlags = exports.MessageActivityType = exports.MessageType = exports.VideoQualityMode = exports.ChannelType = void 0;
/**
 * https://discord.com/developers/docs/resources/channel#channel-object-channel-types
 */
var ChannelType;
(function (ChannelType) {
    /**
     * A text channel within a guild
     */
    ChannelType[ChannelType["GuildText"] = 0] = "GuildText";
    /**
     * A direct message between users
     */
    ChannelType[ChannelType["DM"] = 1] = "DM";
    /**
     * A voice channel within a guild
     */
    ChannelType[ChannelType["GuildVoice"] = 2] = "GuildVoice";
    /**
     * A direct message between multiple users
     */
    ChannelType[ChannelType["GroupDM"] = 3] = "GroupDM";
    /**
     * An organizational category that contains up to 50 channels
     *
     * See https://support.discord.com/hc/en-us/articles/115001580171-Channel-Categories-101
     */
    ChannelType[ChannelType["GuildCategory"] = 4] = "GuildCategory";
    /**
     * A channel that users can follow and crosspost into their own guild
     *
     * See https://support.discord.com/hc/en-us/articles/360032008192
     */
    ChannelType[ChannelType["GuildNews"] = 5] = "GuildNews";
    /**
     * A thread channel (public) within a Guild News channel
     */
    ChannelType[ChannelType["GuildNewsThread"] = 10] = "GuildNewsThread";
    /**
     * A public thread channel within a Guild Text channel
     */
    ChannelType[ChannelType["GuildPublicThread"] = 11] = "GuildPublicThread";
    /**
     * A private thread channel within a Guild Text channel
     */
    ChannelType[ChannelType["GuildPrivateThread"] = 12] = "GuildPrivateThread";
    /**
     * A voice channel for hosting events with an audience
     *
     * See https://support.discord.com/hc/en-us/articles/1500005513722
     */
    ChannelType[ChannelType["GuildStageVoice"] = 13] = "GuildStageVoice";
    /**
     * The channel in a Student Hub containing the listed servers
     *
     * See https://support.discord.com/hc/en-us/articles/4406046651927-Discord-Student-Hubs-FAQ
     */
    ChannelType[ChannelType["GuildDirectory"] = 14] = "GuildDirectory";
    /**
     * A channel that can only contain threads
     */
    ChannelType[ChannelType["GuildForum"] = 15] = "GuildForum";
})(ChannelType = exports.ChannelType || (exports.ChannelType = {}));
var VideoQualityMode;
(function (VideoQualityMode) {
    /**
     * Discord chooses the quality for optimal performance
     */
    VideoQualityMode[VideoQualityMode["Auto"] = 1] = "Auto";
    /**
     * 720p
     */
    VideoQualityMode[VideoQualityMode["Full"] = 2] = "Full";
})(VideoQualityMode = exports.VideoQualityMode || (exports.VideoQualityMode = {}));
/**
 * https://discord.com/developers/docs/resources/channel#message-object-message-types
 */
var MessageType;
(function (MessageType) {
    MessageType[MessageType["Default"] = 0] = "Default";
    MessageType[MessageType["RecipientAdd"] = 1] = "RecipientAdd";
    MessageType[MessageType["RecipientRemove"] = 2] = "RecipientRemove";
    MessageType[MessageType["Call"] = 3] = "Call";
    MessageType[MessageType["ChannelNameChange"] = 4] = "ChannelNameChange";
    MessageType[MessageType["ChannelIconChange"] = 5] = "ChannelIconChange";
    MessageType[MessageType["ChannelPinnedMessage"] = 6] = "ChannelPinnedMessage";
    MessageType[MessageType["UserJoin"] = 7] = "UserJoin";
    MessageType[MessageType["GuildBoost"] = 8] = "GuildBoost";
    MessageType[MessageType["GuildBoostTier1"] = 9] = "GuildBoostTier1";
    MessageType[MessageType["GuildBoostTier2"] = 10] = "GuildBoostTier2";
    MessageType[MessageType["GuildBoostTier3"] = 11] = "GuildBoostTier3";
    MessageType[MessageType["ChannelFollowAdd"] = 12] = "ChannelFollowAdd";
    MessageType[MessageType["GuildDiscoveryDisqualified"] = 14] = "GuildDiscoveryDisqualified";
    MessageType[MessageType["GuildDiscoveryRequalified"] = 15] = "GuildDiscoveryRequalified";
    MessageType[MessageType["GuildDiscoveryGracePeriodInitialWarning"] = 16] = "GuildDiscoveryGracePeriodInitialWarning";
    MessageType[MessageType["GuildDiscoveryGracePeriodFinalWarning"] = 17] = "GuildDiscoveryGracePeriodFinalWarning";
    MessageType[MessageType["ThreadCreated"] = 18] = "ThreadCreated";
    MessageType[MessageType["Reply"] = 19] = "Reply";
    MessageType[MessageType["ChatInputCommand"] = 20] = "ChatInputCommand";
    MessageType[MessageType["ThreadStarterMessage"] = 21] = "ThreadStarterMessage";
    MessageType[MessageType["GuildInviteReminder"] = 22] = "GuildInviteReminder";
    MessageType[MessageType["ContextMenuCommand"] = 23] = "ContextMenuCommand";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
/**
 * https://discord.com/developers/docs/resources/channel#message-object-message-activity-types
 */
var MessageActivityType;
(function (MessageActivityType) {
    MessageActivityType[MessageActivityType["Join"] = 1] = "Join";
    MessageActivityType[MessageActivityType["Spectate"] = 2] = "Spectate";
    MessageActivityType[MessageActivityType["Listen"] = 3] = "Listen";
    MessageActivityType[MessageActivityType["JoinRequest"] = 5] = "JoinRequest";
})(MessageActivityType = exports.MessageActivityType || (exports.MessageActivityType = {}));
/**
 * https://discord.com/developers/docs/resources/channel#message-object-message-flags
 */
var MessageFlags;
(function (MessageFlags) {
    /**
     * This message has been published to subscribed channels (via Channel Following)
     */
    MessageFlags[MessageFlags["Crossposted"] = 1] = "Crossposted";
    /**
     * This message originated from a message in another channel (via Channel Following)
     */
    MessageFlags[MessageFlags["IsCrosspost"] = 2] = "IsCrosspost";
    /**
     * Do not include any embeds when serializing this message
     */
    MessageFlags[MessageFlags["SuppressEmbeds"] = 4] = "SuppressEmbeds";
    /**
     * The source message for this crosspost has been deleted (via Channel Following)
     */
    MessageFlags[MessageFlags["SourceMessageDeleted"] = 8] = "SourceMessageDeleted";
    /**
     * This message came from the urgent message system
     */
    MessageFlags[MessageFlags["Urgent"] = 16] = "Urgent";
    /**
     * This message has an associated thread, which shares its id
     */
    MessageFlags[MessageFlags["HasThread"] = 32] = "HasThread";
    /**
     * This message is only visible to the user who invoked the Interaction
     */
    MessageFlags[MessageFlags["Ephemeral"] = 64] = "Ephemeral";
    /**
     * This message is an Interaction Response and the bot is "thinking"
     */
    MessageFlags[MessageFlags["Loading"] = 128] = "Loading";
    /**
     * This message failed to mention some roles and add their members to the thread
     */
    MessageFlags[MessageFlags["FailedToMentionSomeRolesInThread"] = 256] = "FailedToMentionSomeRolesInThread";
})(MessageFlags = exports.MessageFlags || (exports.MessageFlags = {}));
var OverwriteType;
(function (OverwriteType) {
    OverwriteType[OverwriteType["Role"] = 0] = "Role";
    OverwriteType[OverwriteType["Member"] = 1] = "Member";
})(OverwriteType = exports.OverwriteType || (exports.OverwriteType = {}));
var ThreadAutoArchiveDuration;
(function (ThreadAutoArchiveDuration) {
    ThreadAutoArchiveDuration[ThreadAutoArchiveDuration["OneHour"] = 60] = "OneHour";
    ThreadAutoArchiveDuration[ThreadAutoArchiveDuration["OneDay"] = 1440] = "OneDay";
    ThreadAutoArchiveDuration[ThreadAutoArchiveDuration["ThreeDays"] = 4320] = "ThreeDays";
    ThreadAutoArchiveDuration[ThreadAutoArchiveDuration["OneWeek"] = 10080] = "OneWeek";
})(ThreadAutoArchiveDuration = exports.ThreadAutoArchiveDuration || (exports.ThreadAutoArchiveDuration = {}));
var ThreadMemberFlags;
(function (ThreadMemberFlags) {
})(ThreadMemberFlags = exports.ThreadMemberFlags || (exports.ThreadMemberFlags = {}));
/**
 * https://discord.com/developers/docs/resources/channel#embed-object-embed-types
 * @deprecated *Embed types should be considered deprecated and might be removed in a future API version*
 */
var EmbedType;
(function (EmbedType) {
    /**
     * Generic embed rendered from embed attributes
     */
    EmbedType["Rich"] = "rich";
    /**
     * Image embed
     */
    EmbedType["Image"] = "image";
    /**
     * Video embed
     */
    EmbedType["Video"] = "video";
    /**
     * Animated gif image embed rendered as a video embed
     */
    EmbedType["GIFV"] = "gifv";
    /**
     * Article embed
     */
    EmbedType["Article"] = "article";
    /**
     * Link embed
     */
    EmbedType["Link"] = "link";
})(EmbedType = exports.EmbedType || (exports.EmbedType = {}));
/**
 * https://discord.com/developers/docs/resources/channel#allowed-mentions-object-allowed-mention-types
 */
var AllowedMentionsTypes;
(function (AllowedMentionsTypes) {
    /**
     * Controls @everyone and @here mentions
     */
    AllowedMentionsTypes["Everyone"] = "everyone";
    /**
     * Controls role mentions
     */
    AllowedMentionsTypes["Role"] = "roles";
    /**
     * Controls user mentions
     */
    AllowedMentionsTypes["User"] = "users";
})(AllowedMentionsTypes = exports.AllowedMentionsTypes || (exports.AllowedMentionsTypes = {}));
/**
 * https://discord.com/developers/docs/interactions/message-components#component-types
 */
var ComponentType;
(function (ComponentType) {
    /**
     * Action Row component
     */
    ComponentType[ComponentType["ActionRow"] = 1] = "ActionRow";
    /**
     * Button component
     */
    ComponentType[ComponentType["Button"] = 2] = "Button";
    /**
     * Select Menu component
     */
    ComponentType[ComponentType["SelectMenu"] = 3] = "SelectMenu";
    /**
     * Text Input component
     */
    ComponentType[ComponentType["TextInput"] = 4] = "TextInput";
})(ComponentType = exports.ComponentType || (exports.ComponentType = {}));
/**
 * https://discord.com/developers/docs/interactions/message-components#button-object-button-styles
 */
var ButtonStyle;
(function (ButtonStyle) {
    ButtonStyle[ButtonStyle["Primary"] = 1] = "Primary";
    ButtonStyle[ButtonStyle["Secondary"] = 2] = "Secondary";
    ButtonStyle[ButtonStyle["Success"] = 3] = "Success";
    ButtonStyle[ButtonStyle["Danger"] = 4] = "Danger";
    ButtonStyle[ButtonStyle["Link"] = 5] = "Link";
})(ButtonStyle = exports.ButtonStyle || (exports.ButtonStyle = {}));
/**
 * https://discord.com/developers/docs/interactions/message-components#text-inputs-text-input-styles
 */
var TextInputStyle;
(function (TextInputStyle) {
    TextInputStyle[TextInputStyle["Short"] = 1] = "Short";
    TextInputStyle[TextInputStyle["Paragraph"] = 2] = "Paragraph";
})(TextInputStyle = exports.TextInputStyle || (exports.TextInputStyle = {}));
/**
 * https://discord.com/developers/docs/resources/channel#channel-object-channel-flags
 */
var ChannelFlags;
(function (ChannelFlags) {
    ChannelFlags[ChannelFlags["Pinned"] = 2] = "Pinned";
})(ChannelFlags = exports.ChannelFlags || (exports.ChannelFlags = {}));
//# sourceMappingURL=channel.js.map