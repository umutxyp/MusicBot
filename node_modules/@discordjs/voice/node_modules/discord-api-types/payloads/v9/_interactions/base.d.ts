import type { InteractionType } from './responses';
import type { Permissions, Snowflake } from '../../../globals';
import type { LocaleString } from '../../../v9';
import type { APIMessage } from '../channel';
import type { APIGuildMember } from '../guild';
import type { APIUser } from '../user';
export declare type PartialAPIMessageInteractionGuildMember = Pick<APIGuildMember, 'roles' | 'premium_since' | 'pending' | 'nick' | 'mute' | 'joined_at' | 'deaf' | 'communication_disabled_until' | 'avatar'>;
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#message-interaction-object
 */
export interface APIMessageInteraction {
    /**
     * ID of the interaction
     */
    id: Snowflake;
    /**
     * The type of interaction
     */
    type: InteractionType;
    /**
     * The name of the application command, including subcommands and subcommand groups
     */
    name: string;
    /**
     * The user who invoked the interaction
     */
    user: APIUser;
    /**
     * The guild member who invoked the interaction, only sent in MESSAGE_CREATE events
     */
    member?: PartialAPIMessageInteractionGuildMember;
}
/**
 * https://discord.com/developers/docs/resources/guild#guild-member-object
 */
export interface APIInteractionGuildMember extends APIGuildMember {
    permissions: Permissions;
    user: APIUser;
}
/**
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
export interface APIBaseInteraction<Type extends InteractionType, Data> {
    /**
     * ID of the interaction
     */
    id: Snowflake;
    /**
     * ID of the application this interaction is for
     */
    application_id: Snowflake;
    /**
     * The type of interaction
     */
    type: Type;
    /**
     * The command data payload
     */
    data?: Data;
    /**
     * The guild it was sent from
     */
    guild_id?: Snowflake;
    /**
     * The channel it was sent from
     */
    channel_id?: Snowflake;
    /**
     * Guild member data for the invoking user, including permissions
     *
     * **This is only sent when an interaction is invoked in a guild**
     */
    member?: APIInteractionGuildMember;
    /**
     * User object for the invoking user, if invoked in a DM
     */
    user?: APIUser;
    /**
     * A continuation token for responding to the interaction
     */
    token: string;
    /**
     * Read-only property, always `1`
     */
    version: 1;
    /**
     * For components, the message they were attached to
     */
    message?: APIMessage;
    /**
     * Bitwise set of permissions the app or bot has within the channel the interaction was sent from
     */
    app_permissions?: Permissions;
    /**
     * The selected language of the invoking user
     */
    locale: LocaleString;
    /**
     * The guild's preferred locale, if invoked in a guild
     */
    guild_locale?: LocaleString;
}
export declare type APIDMInteractionWrapper<Original extends APIBaseInteraction<InteractionType, unknown>> = Omit<Original, 'member' | 'guild_id'> & Required<Pick<Original, 'user'>>;
export declare type APIGuildInteractionWrapper<Original extends APIBaseInteraction<InteractionType, unknown>> = Omit<Original, 'user'> & Required<Pick<Original, 'member' | 'guild_id'>>;
//# sourceMappingURL=base.d.ts.map