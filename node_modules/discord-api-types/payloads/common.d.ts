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
/**
 * https://discord.com/developers/docs/topics/opcodes-and-status-codes#json
 */
export interface RESTError {
    code: number;
    message: string;
    errors?: RESTErrorData;
}
export interface RESTErrorFieldInformation {
    code: string;
    message: string;
}
export interface RESTErrorGroupWrapper {
    _errors: RESTErrorData[];
}
export declare type RESTErrorData = RESTErrorGroupWrapper | RESTErrorFieldInformation | {
    [k: string]: RESTErrorData;
} | string;
/**
 * https://discord.com/developers/docs/topics/rate-limits#exceeding-a-rate-limit-rate-limit-response-structure
 */
export interface RESTRateLimit {
    /**
     * An error code for some limits
     *
     * {@link RESTJSONErrorCodes}
     */
    code?: number;
    /**
     * A value indicating if you are being globally rate limited or not
     */
    global: boolean;
    /**
     * A message saying you are being rate limited.
     */
    message: string;
    /**
     * The number of seconds to wait before submitting another request.
     */
    retry_after: number;
}
//# sourceMappingURL=common.d.ts.map