import type { LocaleString } from '../rest/common';
/**
 * https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
 *
 * These flags are exported as `BigInt`s and NOT numbers. Wrapping them in `Number()`
 * may cause issues, try to use BigInts as much as possible or modules that can
 * replicate them in some way
 */
export declare const PermissionFlagsBits: {
    readonly CreateInstantInvite: bigint;
    readonly KickMembers: bigint;
    readonly BanMembers: bigint;
    readonly Administrator: bigint;
    readonly ManageChannels: bigint;
    readonly ManageGuild: bigint;
    readonly AddReactions: bigint;
    readonly ViewAuditLog: bigint;
    readonly PrioritySpeaker: bigint;
    readonly Stream: bigint;
    readonly ViewChannel: bigint;
    readonly SendMessages: bigint;
    readonly SendTTSMessages: bigint;
    readonly ManageMessages: bigint;
    readonly EmbedLinks: bigint;
    readonly AttachFiles: bigint;
    readonly ReadMessageHistory: bigint;
    readonly MentionEveryone: bigint;
    readonly UseExternalEmojis: bigint;
    readonly ViewGuildInsights: bigint;
    readonly Connect: bigint;
    readonly Speak: bigint;
    readonly MuteMembers: bigint;
    readonly DeafenMembers: bigint;
    readonly MoveMembers: bigint;
    readonly UseVAD: bigint;
    readonly ChangeNickname: bigint;
    readonly ManageNicknames: bigint;
    readonly ManageRoles: bigint;
    readonly ManageWebhooks: bigint;
    readonly ManageEmojisAndStickers: bigint;
    readonly UseApplicationCommands: bigint;
    readonly RequestToSpeak: bigint;
    readonly ManageEvents: bigint;
    readonly ManageThreads: bigint;
    readonly CreatePublicThreads: bigint;
    readonly CreatePrivateThreads: bigint;
    readonly UseExternalStickers: bigint;
    readonly SendMessagesInThreads: bigint;
    readonly UseEmbeddedActivities: bigint;
    readonly ModerateMembers: bigint;
};
export declare type LocalizationMap = Partial<Record<LocaleString, string | null>>;
//# sourceMappingURL=common.d.ts.map